/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import VsErrorConsoleLogger from '../loggers/VsErrorConsoleLogger';
import CustomObjectService from '../service/ImportObjectService';
import { ANSWERS, IMPORT_OBJECTS } from '../service/TranslationKeys';
import { actionResultStatus, ApplicationConstants, InteractiveAnswersValidator, objectTypes, ProjectInfoService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'importobjects';

export default class ImportObjects extends BaseAction {
	private customObjectService: CustomObjectService;

	constructor() {
		super(COMMAND_NAME);
		this.customObjectService = new CustomObjectService(this.messageService, this.translationService);
	}

	protected async execute() {
		if (!this.activeFile || !this.rootWorkspaceFolder) {
			//already  checked in validate. Should not throw
			throw 'Unexpected error at list objects';
		}
		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());

		let relativeDestinationFolder = ApplicationConstants.FOLDERS.OBJECTS;
		if (this.isSelectedFromContextMenu) {
			relativeDestinationFolder = this.getDestinationFolder(this.activeFile);
		}

		let appId: string = '';
		if (projectInfoService.isSuiteAppProject()) {
			const filterAppId = await this.promptFilterAppId();
			if (!filterAppId) {
				return;
			}

			if (filterAppId === this.translationService.getMessage(ANSWERS.YES)) {
				let questionAppId = await this.promptAppId(projectInfoService);
				if (questionAppId === undefined) {
					return;
				}
				appId = questionAppId;
			}
		}

		const selectedObjectTypes = await this.promptObjectTypes();
		if (!selectedObjectTypes) {
			return;
		}

		const scriptIdFilter = await this.promptScriptIdFilter();
		if (scriptIdFilter === undefined) {
			return;
		}

		const listObjectsResult = await this.customObjectService.listObjects(
			appId,
			selectedObjectTypes,
			scriptIdFilter,
			this.rootWorkspaceFolder,
			new VsErrorConsoleLogger(true, this.rootWorkspaceFolder)
		);
		if (listObjectsResult.status !== 'SUCCESS' || !listObjectsResult.data || listObjectsResult.data.length === 0) {
			this.showOutput(listObjectsResult);
			return;
		}

		const selectedScriptIds = await this.promptObjects(listObjectsResult.data);
		if (!selectedScriptIds) {
			return;
		}

		let includeReferencedFiles = this.translationService.getMessage(ANSWERS.NO);
		if (projectInfoService.isAccountCustomizationProject()) {
			includeReferencedFiles = await this.promptIncludeReferencedFiles();
			if (!includeReferencedFiles) {
				return;
			}
		}

		const overwrite = await this.promptOverwrite(includeReferencedFiles);
		if (!overwrite) {
			return;
		}
		if (overwrite === this.translationService.getMessage(ANSWERS.NO)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_OBJECTS.PROCESS_CANCELED));
			return;
		}

		const actionResult = await this.customObjectService.importObjects(
			relativeDestinationFolder,
			appId,
			selectedScriptIds,
			includeReferencedFiles === this.translationService.getMessage(ANSWERS.YES),
			this.rootWorkspaceFolder,
			this.vsConsoleLogger
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

	private async promptFilterAppId() {
		return await window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.FILTER_APP_ID),
			canPickMany: false,
		});
	}

	private async promptAppId(projectInfoService: { getApplicationId: () => string }): Promise<string | undefined> {
		const defaultAppId = projectInfoService.getApplicationId();
		let appId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.APP_ID, defaultAppId),
			validateInput: (fieldValue) => {
				if (fieldValue === '') {
					return null; //In this case empty field is valid
				}
				let validationResult = InteractiveAnswersValidator.showValidationResults(fieldValue, InteractiveAnswersValidator.validateSuiteApp);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
		if (appId === undefined) {
			return;
		}

		if (appId === '') {
			appId = defaultAppId;
		}
		return appId;
	}

	private async promptScriptIdFilter() {
		let scriptId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SCRIPT_ID),
			validateInput: (fieldValue) => {
				if (fieldValue === '') {
					return null; //In this case empty field is valid
				}
				let validationResult = InteractiveAnswersValidator.showValidationResults(fieldValue, InteractiveAnswersValidator.validateScriptId);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});

		return scriptId;
	}

	private async promptObjectTypes(): Promise<string[] | undefined> {
		return await window.showQuickPick(
			objectTypes.map((objectType) => objectType.value.type),
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_TYPES),
				canPickMany: true,
			}
		);
	}

	private async promptObjects(objectList: any[]): Promise<string[] | undefined> {
		let selectedObjects: string[] | undefined = [];

		while (selectedObjects.length === 0) {
			selectedObjects = await window.showQuickPick(
				objectList.map((object: { scriptId: string }) => object.scriptId),
				{
					placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_OBJECTS),
					canPickMany: true,
				}
			);
			if (selectedObjects === undefined) {
				return;
			}
		}
		return selectedObjects;
	}

	private async promptIncludeReferencedFiles() {
		return await window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.REFERENCED_FILES),
			canPickMany: false,
		});
	}

	private async promptOverwrite(includeReferencedFiles: string) {
		return await window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder:
				includeReferencedFiles === this.translationService.getMessage(ANSWERS.NO)
					? this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE_WITH_REFERENCED)
					: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE),
			canPickMany: false,
		});
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			if (actionResult.data.length === 0) {
				this.messageService.showErrorMessage(this.translationService.getMessage(IMPORT_OBJECTS.ERROR.EMPTY_LIST_SEARCH));
				return;
			}
			this.messageService.showCommandInfo(this.translationService.getMessage(IMPORT_OBJECTS.FINISHED));
		} else {
			this.messageService.showCommandError();
		}
	}

}
