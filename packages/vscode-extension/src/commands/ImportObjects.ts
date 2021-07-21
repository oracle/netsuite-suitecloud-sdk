/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as fs from 'fs';
import * as path from 'path';
import { Uri, window } from 'vscode';
import CustomObjectService from '../service/ImportObjectService';
import { ANSWERS, ERRORS, IMPORT_OBJECTS } from '../service/TranslationKeys';
import { actionResultStatus, ApplicationConstants, InteractiveAnswersValidator, ProjectInfoService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');

const COMMAND_NAME = 'importobjects';

export default class ImportObjects extends BaseAction {
	private customObjectService: CustomObjectService;

	constructor() {
		super(COMMAND_NAME);
		this.customObjectService = new CustomObjectService(this.messageService);
	}

	protected init(uri?: Uri) {
		super.init(uri);
		this.customObjectService.setVsConsoleLogger(this.vsConsoleLogger);
	}

	protected async execute() {
		if (!this.activeFile) {
			// Already checked in validate
			return;
		}
		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());

		const destinationFolder = this.getDestinationFolder(this.activeFile);
		if (!destinationFolder.startsWith(ApplicationConstants.FOLDERS.OBJECTS)) {
			this.messageService.showErrorMessage(this.translationService.getMessage(IMPORT_OBJECTS.ERROR.INCORRECT_FOLDER));
			return;
		}

		let appId: string | undefined;
		if (projectInfoService.isSuiteAppProject()) {
			appId = await this.promptAppId(projectInfoService);
		}

		const selectedObjectTypes = await this.getSelectedObjectTypes();

		if (!selectedObjectTypes) {
			return;
		}

		const scriptId = await this.promptSelectedScriptId();
		const includeReferencedFiles = await this.promptIncludeReferencedFiles();
		const overwrite = await this.promptOverwrite(includeReferencedFiles);
		if (!overwrite || overwrite === this.translationService.getMessage(ANSWERS.NO)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_OBJECTS.PROCESS_CANCELED));
			return;
		}

		const listObjectsResult = await this.listObjects(appId, selectedObjectTypes, scriptId, includeReferencedFiles);
		if (listObjectsResult.status !== 'SUCCESS' || !listObjectsResult.data || listObjectsResult.data.length == 0) {
			this.showOutput(listObjectsResult);
			return;
		}

		const selectedScriptIds = await this.promptSelectedObjects(listObjectsResult.data);

		if (!selectedScriptIds || selectedScriptIds.length == 0) {
			this.messageService.showCommandError(this.translationService.getMessage(IMPORT_OBJECTS.ERROR.EMPTY_LIST));
			return;
		}

		const statusBarMessage = this.translationService.getMessage(IMPORT_OBJECTS.IMPORTING_OBJECTS);
		const actionResult = await this.customObjectService.importObjects(
			destinationFolder,
			appId,
			selectedScriptIds,
			includeReferencedFiles === this.translationService.getMessage(ANSWERS.YES),
			statusBarMessage,
			this.executionPath
		);

		this.showOutput(actionResult);
		return actionResult;
	}

	private getDestinationFolder(pathDir: string) {
		const isDirectory = fs.lstatSync(pathDir).isDirectory();
		const directoryName = isDirectory ? pathDir : path.dirname(pathDir);
		const destinationFolder = directoryName.split(this.getProjectFolderPath())[1].replace(/\\/gi, '/');
		return destinationFolder;
	}

	private async promptAppId(projectInfoService: { getPublisherId: () => string }) {
		const filterAppId = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.FILTER_APP_ID),
				canPickMany: false,
			}
		);

		if (filterAppId && filterAppId == this.translationService.getMessage(ANSWERS.NO)) {
			return;
		}

		const defaultAppId = projectInfoService.getPublisherId();
		let appId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.APP_ID, defaultAppId),
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(fieldValue, InteractiveAnswersValidator.validatePublisherId);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});

		if (appId == undefined || appId.length == 0) {
			appId = defaultAppId;
		}
		return appId;
	}

	private async promptSelectedScriptId() {
		let scriptId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SCRIPT_ID),
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue
					// InteractiveAnswersValidator.validateFieldIsNotEmpty,
					// InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended,
					// InteractiveAnswersValidator.validateScriptId
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});

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

	private async promptIncludeReferencedFiles() {
		return await window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.REFERENCED_FILES),
			canPickMany: false,
		});
	}

	private async promptOverwrite(includeReferencedFiles: string | undefined) {
		return await window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder:
				includeReferencedFiles === this.translationService.getMessage(ANSWERS.NO)
					? this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE_WITH_REFERENCED)
					: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE),
			canPickMany: false,
		});
	}

	private async listObjects(
		appId: string | undefined,
		selectedObjectTypes: string[],
		scriptId: string | undefined,
		includeReferencedFiles: string | undefined
	) {
		const statusBarMessage = this.translationService.getMessage(IMPORT_OBJECTS.IMPORTING_OBJECTS);
		const actionResult = await this.customObjectService.listObjects(
			appId,
			selectedObjectTypes,
			scriptId,
			includeReferencedFiles === this.translationService.getMessage(ANSWERS.YES),
			statusBarMessage,
			this.executionPath
		);
		return actionResult;
	}

	private async promptSelectedObjects(objectList: any[]): Promise<string[] | undefined> {
		const selectedObjects = await window.showQuickPick(
			objectList.map((object) => object.scriptId),
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_TYPES),
				canPickMany: true,
			}
		);
		return selectedObjects;
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
