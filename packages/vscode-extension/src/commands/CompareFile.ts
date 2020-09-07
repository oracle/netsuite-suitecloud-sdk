/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { ERRORS, COMPARE_FILE } from '../service/TranslationKeys';
import { actionResultStatus, FileUtils, TranslationService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import ImportFileService from '../service/ImportFileService';

const fs = require('fs');

const COMMAND_NAME = 'file:import';
const TMP_DIR = '\\tmp';

export default class CompareFile extends BaseAction {
	private importFileService: ImportFileService;

	constructor() {
		super(COMMAND_NAME);
		this.importFileService = new ImportFileService(this.messageService, this.translationService, this.filePath);
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
			const statusBarMessage = this.translationService.getMessage(COMPARE_FILE.COMPARING);
			const actionResult = await this.importFileService.importFile(activeFile, dir, statusBarMessage, this.executionPath, false);
			await this.showOutput(actionResult);
			if (actionResult.status === actionResultStatus.SUCCESS) {
				await this.showFileDiff(activeFile, tempDir, fileName);
			}
		} catch (e) {
			this.messageService.showErrorMessage(e.message);
		} finally {
			FileUtils.deleteDirandFilesRecursively(tempDir);
		}
	}

	private async showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			this.messageService.showCommandInfo(this.translationService.getMessage(COMPARE_FILE.SUCCESS));
		} else {
			this.messageService.showCommandError();
		}
	}

	private async showFileDiff(activeFile: string, tmpDir: string, fileName: string) {
		await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.diff',
			vscode.Uri.file(activeFile),
			vscode.Uri.file(tmpDir + '\\' + fileName),
			this.translationService.getMessage(COMPARE_FILE.EDITOR_TITLE, fileName)
		);
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
