/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { parseSuiteCloudPanelIncomingMessage } from '../../controlPanel/MessageParser';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../controlPanel/Strings';
import {
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelOutgoingMessage,
} from '../../controlPanel/Types';
import HtmlRenderer, { WebviewMode } from './HtmlRenderer';

const PANEL_VIEW_TYPE = 'suitecloudControlPanel';
const PANEL_TITLE = SUITECLOUD_PANEL_RUNTIME_STRINGS.panelTitle;
const SIDEBAR_CONTAINER_ID = 'suitecloud';
const SIDEBAR_VIEW_ID = 'suitecloud.devAssistControlPanelView';

export type ViewHostCallbacks = {
	onMessage: (message: SuiteCloudPanelIncomingMessage) => void;
	onRefreshRequested: () => void;
	onStateRequested: () => void;
	onInvalidMessage: () => void;
	onExpandedStateChanged: (isExpanded: boolean) => void;
};

export default class ViewHost implements vscode.WebviewViewProvider {
	private readonly _extensionPath: string;
	private readonly _htmlRenderer: HtmlRenderer;
	private readonly _callbacks: ViewHostCallbacks;
	private _panel: vscode.WebviewPanel | undefined;
	private _sidebarView: vscode.WebviewView | undefined;

	constructor(extensionPath: string, callbacks: ViewHostCallbacks) {
		this._extensionPath = extensionPath;
		this._htmlRenderer = new HtmlRenderer(extensionPath);
		this._callbacks = callbacks;
	}

	register(extensionContext: vscode.ExtensionContext): void {
		const viewRegistration = vscode.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, this, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		});
		const extensionChangeSubscription = vscode.extensions.onDidChange(
			this._callbacks.onRefreshRequested
		);
		extensionContext.subscriptions.push(viewRegistration, extensionChangeSubscription);
	}

	async focusSidebar(): Promise<void> {
		this._panel?.dispose();
		await vscode.commands.executeCommand(`workbench.view.extension.${SIDEBAR_CONTAINER_ID}`);
		await vscode.commands.executeCommand(`${SIDEBAR_VIEW_ID}.focus`);
	}

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	): void {
		this._sidebarView = webviewView;
		this._configureWebview(webviewView.webview, 'sidebar');
		this._callbacks.onStateRequested();

		webviewView.onDidChangeVisibility(() => {
			if (webviewView.visible) {
				this._callbacks.onRefreshRequested();
			}
		});
		webviewView.onDidDispose(() => {
			if (this._sidebarView === webviewView) {
				this._sidebarView = undefined;
			}
		});
	}

	openPanel(): void {
		if (this._panel) {
			this._panel.reveal(vscode.ViewColumn.One);
			return;
		}

		this._panel = vscode.window.createWebviewPanel(
			PANEL_VIEW_TYPE,
			PANEL_TITLE,
			vscode.ViewColumn.One,
			{}
		);
		this._configureWebview(this._panel.webview, 'panel');
		this._callbacks.onExpandedStateChanged(true);
		this._panel.onDidChangeViewState(({ webviewPanel }) => {
			if (webviewPanel.visible) {
				this._callbacks.onRefreshRequested();
			}
		});
		this._panel.onDidDispose(() => {
			this._panel = undefined;
			this._callbacks.onExpandedStateChanged(false);
		});
	}

	postMessage(message: SuiteCloudPanelOutgoingMessage): void {
		if (this._panel) {
			void this._panel.webview.postMessage(message);
		}
		if (this._sidebarView) {
			void this._sidebarView.webview.postMessage(message);
		}
	}

	dispose(): void {
		this._panel?.dispose();
		this._panel = undefined;
		this._sidebarView = undefined;
	}

	private _configureWebview(webview: vscode.Webview, mode: WebviewMode): void {
		webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(this._extensionPath, 'resources')),
				vscode.Uri.file(
					path.join(this._extensionPath, 'node_modules', '@vscode', 'codicons', 'dist')
				),
			],
		};
		webview.html = this._htmlRenderer.render(webview, mode);
		webview.onDidReceiveMessage((rawMessage: unknown) => {
			const message = parseSuiteCloudPanelIncomingMessage(rawMessage);
			if (message) {
				this._callbacks.onMessage(message);
			} else {
				this._callbacks.onInvalidMessage();
			}
		});
	}
}
