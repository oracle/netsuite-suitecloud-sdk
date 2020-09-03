/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { ERRORS, COMPARE_OBJECT } from '../service/TranslationKeys';
import { actionResultStatus, FileUtils } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
const fs = require('fs');

const COMMAND_NAME = 'object:import';
const TMP_DIR = '\\tmp';

export default class CompareObject extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		const activeFile = this.filePath;
		if (!activeFile) {
			// Already checked in validate
			return;
		}
		const tempDir = path.dirname(activeFile) + TMP_DIR;
		try {
			if (!fs.existsSync(path)) {
				FileUtils.createTempDir(tempDir);
			}

			const dir = tempDir.split(this.executionPath + '\\src')[1].replace(/\\/g, '/');
			const fileName = path.basename(activeFile);

			const actionResult = await this.importObject(activeFile, dir);
			if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
				const importResults = actionResult.data;
				if (
					(importResults.errorImports && importResults.errorImports.length > 0) ||
					(importResults.failedImports && importResults.failedImports.length > 0)
				) {
					this.messageService.showCommandError(this.translationService.getMessage(COMPARE_OBJECT.ERROR));
				} else if (
					(!importResults.errorImports || importResults.errorImports.length == 0) &&
					(!importResults.failedImports || importResults.failedImports.length == 0) &&
					(!importResults.successfulImports || importResults.successfulImports.length == 0)
				) {
					this.messageService.showCommandError(this.translationService.getMessage(COMPARE_OBJECT.ERROR));
				} else {
					this.messageService.showInformationMessage(this.translationService.getMessage(COMPARE_OBJECT.SUCCESS));

					await this.showFileDiff(activeFile, tempDir, fileName);
				}
			} else {
				this.messageService.showCommandError();
			}
			return;
		} catch (e) {
			this.messageService.showErrorMessage(e.message);
		} finally {
			FileUtils.deleteDirandFilesRecursively(tempDir);
		}
	}

	private async showFileDiff(activeFile: string, tmpDir: string, fileName: string ) {
		await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.diff',
			vscode.Uri.file(activeFile),
			vscode.Uri.file(tmpDir + "\\" + fileName),
			'Comparison with object into account'
		);
	}

	private async importObject(activeFile: string | undefined, temporaryDirectory: string) {
		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const scriptId = path.basename(activeFile, '.xml');
		const statusBarMessage = this.translationService.getMessage(COMPARE_OBJECT.COMPARING);

		//TODO Prototype of import...Fix the way we look for destinationFolder
		// It should take the path in reference to the project that could be java or nodejs (with src) types
		const commandActionPromise = this.runSuiteCloudCommand({ scriptid: scriptId, type: 'ALL', destinationfolder: temporaryDirectory });
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		const activeFile = this.filePath;
		if (!activeFile) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE),
			};
		} else if (!this.executionPath) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_WORKSPACE),
			};
		} else {
			return {
				valid: true,
			};
		}
	}
}
