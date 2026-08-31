/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as crypto from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import { SUITECLOUD_PANEL_CLIENT_STRINGS } from '../../controlPanel/devAssist/Strings';
import { SUITECLOUD_PANEL_EVENTS } from '../../controlPanel/devAssist/Messages';
import { FileUtils } from '../../util/ExtensionUtil';

export type WebviewMode = 'sidebar' | 'panel';

const serializeForInlineScript = (value: unknown): string =>
	JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');

export default class HtmlRenderer {
	private readonly _extensionPath: string;

	constructor(extensionPath: string) {
		this._extensionPath = extensionPath;
	}

	render(webview: vscode.Webview, mode: WebviewMode): string {
		const resourcesPath = path.join(this._extensionPath, 'resources');
		const mediaPath = path.join(resourcesPath, 'media');
		const codiconsPath = path.join(
			this._extensionPath,
			'node_modules',
			'@vscode',
			'codicons',
			'dist'
		);
		const cssUri = this._asWebviewUri(webview, path.join(mediaPath, 'SuiteCloudControlPanel.css'));
		const codiconsCssUri = this._asWebviewUri(webview, path.join(codiconsPath, 'codicon.css'));
		const clientScriptUri = this._asWebviewUri(
			webview,
			path.join(mediaPath, 'SuiteCloudControlPanelClient.js')
		);
		const htmlPath = path.join(mediaPath, 'SuiteCloudControlPanel.html');
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
		htmlContent = htmlContent.split('{{SCRIPT_NONCE}}').join(scriptNonce);
		htmlContent = htmlContent.split('{{CSP_SOURCE}}').join(webview.cspSource);
		return htmlContent;
	}

	private _asWebviewUri(webview: vscode.Webview, filePath: string): string {
		return webview.asWebviewUri(vscode.Uri.file(filePath)).toString();
	}
}
