/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { ERRORS, YES, NO, IMPORT_OBJECT } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import ImportObjectService from '../service/ImportObjectService';

const COMMAND_NAME = 'object:import';

export default class ImportObject extends BaseAction {
	protected filePath: string | undefined;
	private importObjectService: ImportObjectService;

	constructor() {
		super(COMMAND_NAME);
		this.importObjectService = new ImportObjectService(this.messageService, this.translationService, this.filePath);
	}

	protected async execute() {
		const activeFile = this.filePath;

		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const scriptId = path.basename(activeFile, '.xml');

		const override = await vscode.window.showQuickPick([YES, NO], {
			placeHolder: this.translationService.getMessage(IMPORT_OBJECT.OVERRIDE, scriptId),
			canPickMany: false,
		});

		if (!override || override === NO) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_OBJECT.PROCESS_CANCELED));
			return;
		}

		const destinationFolder = this.executionPath
			? path
					.dirname(activeFile)
					.split(this.executionPath + '\\src')[1]
					.replace('\\', '/')
			: path.dirname(activeFile);
		const statusBarMessage = this.translationService.getMessage(IMPORT_OBJECT.IMPORTING);
		const actionResult = await this.importObjectService.importObject(activeFile, destinationFolder, statusBarMessage, this.executionPath);

		this.showOutput(actionResult);
		return;
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			const importResults = actionResult.data;
			if (
				(importResults.errorImports && importResults.errorImports.length > 0) ||
				(importResults.failedImports && importResults.failedImports.length > 0)
			) {
				this.messageService.showCommandError(this.translationService.getMessage(IMPORT_OBJECT.ERROR));
			} else if (
				(!importResults.errorImports || importResults.errorImports.length == 0) &&
				(!importResults.failedImports || importResults.failedImports.length == 0) &&
				(!importResults.successfulImports || importResults.successfulImports.length == 0)
			) {
				this.messageService.showCommandError(this.translationService.getMessage(IMPORT_OBJECT.ERROR));
			} else {
				this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_OBJECT.SUCCESS));
			}
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
