/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import DummyConsoleLogger from '../loggers/DummyConsoleLogger';
import ImportObjectService from '../service/ImportObjectService';
import { ANSWERS, ERRORS, IMPORT_OBJECTS } from '../service/TranslationKeys';
import { actionResultStatus, InteractiveAnswersValidator, OBJECT_TYPES } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';


const COMMAND_NAME = 'importobjects';

export default class ImportObjects extends BaseAction {
	private importObjectService: ImportObjectService;

	constructor() {
		super(COMMAND_NAME);
		this.importObjectService = new ImportObjectService(this.messageService);
	}

	protected init(fsPath?: string) {
		super.init(fsPath);
		this.importObjectService.setVsConsoleLogger(this.vsConsoleLogger);
	}

	protected async execute() {
		if (!this.activeFile) {
			// Already checked in validate
			return;
		}

		// const objectTypes = path.basename(this.activeFile, '.xml');
		let objectTypes: string | undefined;
		try {
			objectTypes = await this.getSelectedObjects();
		} catch (error) {
			this.messageService.showErrorMessage(error);
		}

		if (!objectTypes) {
			return;
		}

		const scriptId = await window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SCRIPT_ID),
                validateInput: (fieldValue) => {
                    let validationResult = InteractiveAnswersValidator.showValidationResults(
                        fieldValue,
                        InteractiveAnswersValidator.validateFieldIsNotEmpty,
                        InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended,
                    );
                    return typeof validationResult === 'string' ? validationResult : null;
                },
            }
        );

		const referencedFiles = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.REFERENCED_FILES),
				canPickMany: false,
			}
		);

		const overwrite = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder:
					referencedFiles === this.translationService.getMessage(ANSWERS.NO)
						? this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE_WITH_REFERENCED)
						: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE),
				canPickMany: false,
			}
		);

		if (!overwrite || overwrite === this.translationService.getMessage(ANSWERS.NO)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_OBJECTS.PROCESS_CANCELED));
			return;
		}

		const destinationFolder = this.executionPath ? this.getProjectFolderPath() : path.dirname(this.activeFile);

		const statusBarMessage = this.translationService.getMessage(IMPORT_OBJECTS.IMPORTING_OBJECTS);
		const actionResult = await this.importObjectService.importObjects(
			// selectedObjectsPaths,
			destinationFolder,
			objectTypes,
			scriptId,
			referencedFiles === this.translationService.getMessage(ANSWERS.YES),
			statusBarMessage,
			this.executionPath,
			
		);

		this.showOutput(actionResult);
	}

	private async getSelectedObjects(): Promise<string | undefined> {
		return await window.showQuickPick(
			OBJECT_TYPES.map((customObject: { name: string; value: { type: any; }; }) => ({
				name: customObject.name,
				value: customObject.value.type,
			}),
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_TYPES),
				canPickMany: true,
			}
		));
		
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			this.messageService.showCommandInfo(this.translationService.getMessage(IMPORT_OBJECTS.FINISHED));
		} else {
			this.messageService.showCommandError();
		}
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		if (!this.activeFile) {
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
