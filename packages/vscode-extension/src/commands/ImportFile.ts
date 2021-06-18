/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { ERRORS, ANSWERS, IMPORT_FILES } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import ImportFileService from '../service/ImportFileService';

const COMMAND_NAME = 'importfile';

export default class ImportFile extends BaseAction {
	protected filePath: string | undefined;
	private importFileService: ImportFileService;

	constructor() {
		super(COMMAND_NAME);
		this.importFileService = new ImportFileService(this.messageService, this.translationService, this.filePath);
	}

	protected init(fsPath?: string) {
		super.init(fsPath);
		this.importFileService.setVsConsoleLogger(this.vsConsoleLogger);
	}

	protected async execute() {
		const activeFile = this.filePath;

		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const fileName = path.basename(activeFile, '.xml');

		const excludeProperties = await vscode.window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.EXCLUDE_PROPERTIES, fileName),
				canPickMany: false,
			}
		);

		const override = await vscode.window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.OVERRIDE_SINGLE, fileName),
				canPickMany: false,
			}
		);

		if (!override || override === this.translationService.getMessage(ANSWERS.NO)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_FILES.PROCESS_CANCELED));
			return;
		}

		const destinationFolder = this.executionPath
			? path
					.dirname(activeFile)
					.split(this.executionPath + '\\src')[1]
					.replace('\\', '/')
			: path.dirname(activeFile);
		const statusBarMessage = this.translationService.getMessage(IMPORT_FILES.IMPORTING_FILE);
		const actionResult = await this.importFileService.importFile(
			activeFile,
			destinationFolder,
			statusBarMessage,
			this.executionPath,
			excludeProperties === this.translationService.getMessage(ANSWERS.YES)
		);

		this.showOutput(actionResult);
		return;
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			this.messageService.showCommandInfo(this.translationService.getMessage(IMPORT_FILES.FINISHED));
		} else {
			this.messageService.showCommandError();
		}
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
