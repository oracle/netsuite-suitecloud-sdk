/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import ImportObjectService from '../service/ImportObjectService';
import { ANSWERS, ERRORS, IMPORT_OBJECTS } from '../service/TranslationKeys';
import { actionResultStatus, InteractiveAnswersValidator } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');

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

		const appId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.APP_ID),
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});

		// const objectTypes = path.basename(this.activeFile, '.xml');
		let selectedObjectTypes: string[] | undefined;
		try {
			selectedObjectTypes = await this.getSelectedObjectTypes();
		} catch (error) {
			this.messageService.showErrorMessage(error);
		}

		if (!selectedObjectTypes) {
			return;
		}

		const scriptId = await this.getSelectedScriptId();

		const includeReferencedFiles = await window.showQuickPick(
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
					includeReferencedFiles === this.translationService.getMessage(ANSWERS.NO)
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
		const actionResult = await this.importObjectService.listObjects(
			// selectedObjectsPaths,
			destinationFolder,
			selectedObjectTypes,
			scriptId,
			includeReferencedFiles === this.translationService.getMessage(ANSWERS.YES),
			statusBarMessage,
			this.executionPath
		);

		if (actionResult.status !== 'SUCCESS') {
			this.showOutput(actionResult);
			return;
		}

		const listObjects = actionResult.data;
		if (listObjects.length == 0) {
		}

		const selectedObjects = this.getSelectedObjects(listObjects);

		this.showOutput(actionResult);
	}

	private async getSelectedScriptId() {
		let scriptId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SCRIPT_ID),
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					// InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended,
					InteractiveAnswersValidator.validateScriptId
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});

		if (scriptId == '') {
			scriptId = 'ALL';
		}
		return scriptId;
	}

	private async getSelectedObjectTypes(): Promise<string[] | undefined> {
		const selectedObjectTypes = await window.showQuickPick(
			objectTypes.map((objectType) => objectType.value.type),
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_TYPES),
				canPickMany: true,
			}
		);
		return selectedObjectTypes;
	}

	private async getSelectedObjects(objectList: string[]): Promise<string[] | undefined> {
		const selectedObjectTypes = await window.showQuickPick(
			objectList.map((objectType) => objectType),
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_TYPES),
				canPickMany: true,
			}
		);
		return selectedObjectTypes;
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			if (actionResult.data.length == 0) {
				this.messageService.showCommandError(this.translationService.getMessage(IMPORT_OBJECTS.ERROR.EMPTY_LIST));
				return;
			}
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
function print(OBJECT_TYPES: any) {
	throw new Error('Function not implemented.');
}
