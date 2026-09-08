/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as crypto from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import { DEVELOPER_ASSISTANT } from '../../ApplicationConstants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../developerAssistant/Strings';
import {
	VALID_PROXY_PORT_MAX,
	VALID_PROXY_PORT_MIN,
} from '../developerAssistant/Configuration';
import { SUITECLOUD_PANEL_EVENTS } from '../protocol/Messages';
import { FileUtils } from '../../util/ExtensionUtil';
import { SUITECLOUD_PANEL_CLIENT_STRINGS } from './PanelStrings';

export type WebviewMode = 'sidebar' | 'panel';

const serializeForInlineScript = (value: unknown): string =>
	JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');

export default class PanelRenderer {
	private readonly _extensionPath: string;

	constructor(extensionPath: string) {
		this._extensionPath = extensionPath;
	}

	render(webview: vscode.Webview, mode: WebviewMode): string {
		const resourcesPath = path.join(this._extensionPath, 'resources');
		const controlPanelResourcesPath = path.join(resourcesPath, 'controlPanel');
		const codiconsPath = path.join(
			this._extensionPath,
			'node_modules',
			'@vscode',
			'codicons',
			'dist'
		);
		const cssUri = this._asWebviewUri(
			webview,
			path.join(controlPanelResourcesPath, 'panel.css')
		);
		const codiconsCssUri = this._asWebviewUri(webview, path.join(codiconsPath, 'codicon.css'));
		const clientScriptUri = this._asWebviewUri(
			webview,
			path.join(controlPanelResourcesPath, 'panel.js')
		);
		const htmlPath = path.join(controlPanelResourcesPath, 'panel.html');
		const scriptNonce = crypto.randomBytes(16).toString('base64');

		let htmlContent = FileUtils.readAsString(htmlPath);
		htmlContent = htmlContent.replace('{{CSS_FILE.css}}', cssUri);
		htmlContent = htmlContent.replace('{{CODICONS_CSS}}', codiconsCssUri);
		htmlContent = htmlContent.replace('{{CONTROL_PANEL_JS}}', clientScriptUri);
		htmlContent = htmlContent.replace('{{WEBVIEW_MODE}}', mode);
		htmlContent = htmlContent.replace(
			'{{PANEL_STRINGS_JSON}}',
			serializeForInlineScript(SUITECLOUD_PANEL_CLIENT_STRINGS)
		);
		htmlContent = htmlContent.replace(
			'{{PANEL_EVENTS_JSON}}',
			serializeForInlineScript({
				...SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW,
				...SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW,
			})
		);
		htmlContent = htmlContent.replace(
			'{{PANEL_CONFIG_JSON}}',
			serializeForInlineScript({
				defaultProxyPort: DEVELOPER_ASSISTANT.DEFAULT_VALUES.localPort,
				minimumProxyPort: VALID_PROXY_PORT_MIN,
				maximumProxyPort: VALID_PROXY_PORT_MAX,
			})
		);
		htmlContent = htmlContent
			.split('{{DEFAULT_PROXY_PORT}}')
			.join(String(DEVELOPER_ASSISTANT.DEFAULT_VALUES.localPort));
		htmlContent = htmlContent
			.split('{{MINIMUM_PROXY_PORT}}')
			.join(String(VALID_PROXY_PORT_MIN));
		htmlContent = htmlContent
			.split('{{MAXIMUM_PROXY_PORT}}')
			.join(String(VALID_PROXY_PORT_MAX));
		htmlContent = htmlContent
			.split('{{MODEL_ID}}')
			.join(SUITECLOUD_PANEL_RUNTIME_STRINGS.modelId);
		htmlContent = htmlContent.split('{{SCRIPT_NONCE}}').join(scriptNonce);
		htmlContent = htmlContent.split('{{CSP_SOURCE}}').join(webview.cspSource);
		return htmlContent;
	}

	private _asWebviewUri(webview: vscode.Webview, filePath: string): string {
		return webview.asWebviewUri(vscode.Uri.file(filePath)).toString();
	}
}
