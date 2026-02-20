/*
 ** Copyright (c) 2025 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { FileUtils } from '../util/ExtensionUtil';
import { MEDIA_DIRECTORY } from './MediaFileKeys';

export class MediaFileService {
	private vscodeExtensionMediaPath : string;

	constructor(context: vscode.ExtensionContext) {
		this.vscodeExtensionMediaPath = path.join(context.extensionPath, MEDIA_DIRECTORY);
	}

	public getMediaDirectoryFullPath = () => {
		return this.vscodeExtensionMediaPath;
	}

	public getMediaFileFullPath = (fileName : string) => {
		return path.join(this.vscodeExtensionMediaPath, fileName);
	}

	public generateHTMLContentFromMediaFile = (htmlFileName : string, cssWebviewUri : string) => {
		const htmlFilePath = this.getMediaFileFullPath(htmlFileName);
		let htmlFileContent = FileUtils.readAsString(htmlFilePath);

		htmlFileContent = htmlFileContent.replace('{{CSS_FILE.css}}', cssWebviewUri);
		return htmlFileContent;
	}
}