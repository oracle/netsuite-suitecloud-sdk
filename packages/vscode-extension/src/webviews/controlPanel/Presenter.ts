/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import VSConsoleLogger from '../../loggers/VSConsoleLogger';
import { DEVASSIST_SERVICE } from '../../service/TranslationKeys';
import { VSTranslationService } from '../../service/VSTranslationService';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../controlPanel/devAssist/Strings';
import {
	SuiteCloudPanelAction,
	SuiteCloudPanelOutgoingMessage,
	SUITECLOUD_PANEL_EVENTS,
} from '../../controlPanel/devAssist/Messages';

const OUTPUT_CHANNEL_NAME = 'SuiteCloud: Developer Assistant';
const LOG_PREFIX = SUITECLOUD_PANEL_RUNTIME_STRINGS.logPrefix;

export default class Presenter {
	private readonly _statusBarItem: vscode.StatusBarItem;
	private readonly _outputChannel: vscode.OutputChannel;
	private readonly _logger: VSConsoleLogger;
	private readonly _translationService = new VSTranslationService();
	private readonly _postMessage: (message: SuiteCloudPanelOutgoingMessage) => void;

	constructor(
		statusBarItem: vscode.StatusBarItem,
		workspacePath: string,
		postMessage: (message: SuiteCloudPanelOutgoingMessage) => void
	) {
		this._statusBarItem = statusBarItem;
		this._outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
		this._logger = new VSConsoleLogger(true, workspacePath, this._outputChannel);
		this._postMessage = postMessage;
	}

	dispose(): void {
		this._outputChannel.dispose();
	}

	clearLog(): void {
		this._logger.clear();
	}

	startLogSection(): void {
		this._logger.startSection();
	}

	endLogSection(): void {
		this._logger.endSection();
	}

	proxyLog(line: string, isError?: boolean): void {
		if (isError) {
			this._logger.error(line);
		} else {
			this._logger.info(line);
		}
	}

	info(message: string): void {
		this._logger.info(`${LOG_PREFIX} ${message}`);
	}

	error(message: string): void {
		this._logger.error(`${LOG_PREFIX} ${message}`);
	}

	logSuccess(message: string): void {
		this.info(message);
	}

	showSuccess(message: string): void {
		this.logSuccess(message);
		void vscode.window.showInformationMessage(this.formatNotification(message));
	}

	postActionSuccess(message: string, action: SuiteCloudPanelAction): void {
		this._postMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.ACTION_SUCCESS,
			eventData: { message, action },
		});
	}

	showError(message: string): void {
		this.error(message);
		void vscode.window.showErrorMessage(this.formatNotification(message));
	}

	showProxyStartError(message: string): void {
		const openOutputAction = 'Open Output';
		void vscode.window.showErrorMessage(
			this.formatNotification(message),
			openOutputAction
		).then(
			(selection) => {
				if (selection === openOutputAction) {
					this.openOutput();
				}
			},
			(error) => {
				this.error(`Unable to show proxy startup error notification: ${String(error)}`);
			}
		);
	}

	formatNotification(message: string): string {
		const title = SUITECLOUD_PANEL_RUNTIME_STRINGS.notificationTitle;
		return message.startsWith(`${title}:`) ? message : `${title}: ${message}`;
	}

	openOutput(): void {
		this._outputChannel.show();
	}

	setRunningStatus(): void {
		this._statusBarItem.text = `$(netsuite-mobius-colorless-icon)  ${this._translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.STATUSBAR)}`;
		this._showStatusBarItem();
	}

	setStoppedStatus(): void {
		this._statusBarItem.text = `$(netsuite-mobius-colorless-icon)  ${this._translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.STATUSBAR)}`;
		this._showStatusBarItem();
	}

	setStartingStatus(): void {
		this._statusBarItem.text = '$(sync~spin) SuiteCloud: starting proxy';
		this._showStatusBarItem();
	}

	logApiProviderSettings(baseUrl: string, modelId: string): void {
		const settings = [
			'Use these settings in an OpenAI-compatible tool:',
			'',
			'API Provider: OpenAI Compatible',
			`Base URL: ${baseUrl}`,
			'API Key: Generate or rotate the key in the Dev Assist Control Panel, then copy it.',
			`Model ID: ${modelId}`,
		];
		const contentWidth = Math.max(...settings.map((line) => line.length));
		const border = '*'.repeat(contentWidth + 4);

		this._logger.info('');
		this._logger.info(border);
		settings.forEach((line) => this._logger.info(`* ${line.padEnd(contentWidth)} *`));
		this._logger.info(border);
	}

	private _showStatusBarItem(): void {
		this._statusBarItem.backgroundColor = undefined;
		this._statusBarItem.show();
	}
}
