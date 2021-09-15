/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window } from 'vscode';
import { ANSWERS, COMMAND, LIST_OBJECTS } from '../service/TranslationKeys';
import { InteractiveAnswersValidator, ProjectInfoService, actionResultStatus, objectTypes } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'listobjects';

export default class ListObjects extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		const commandArgs: { [key: string]: string | string[] } = {}

		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());
		if (projectInfoService.isSuiteAppProject()) {
			const filterAppId = await this.promptFilterAppIdQuestion();
			if (!filterAppId) {
				return;
			}

			if (filterAppId === this.translationService.getMessage(ANSWERS.YES)) {
				let appId = await this.promptAppIdQuestion(projectInfoService);
				if (appId === undefined) {
					return;
				}
				commandArgs.appid = appId;
			}
		}

		const selectedObjectTypes = await this.promptSelectObjectTypesQuestion();
		if (selectedObjectTypes === undefined) {
			return;
		}
		if (selectedObjectTypes.length !== 0) {
			commandArgs.type = selectedObjectTypes
		}

		const scriptIdFilter = await this.promptFilterScriptIdQuestion();
		if (scriptIdFilter === undefined) {
			return;
		}
		commandArgs.scriptid = scriptIdFilter;

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(LIST_OBJECTS.LISTING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}

	private async promptFilterScriptIdQuestion(): Promise<string | undefined> {
		return window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(LIST_OBJECTS.QUESTIONS.FILTER_SCRIPT_ID),
			validateInput: (fieldValue) => {
				if (fieldValue === '') {
					return null;
				}
				let validationResult = InteractiveAnswersValidator.showValidationResults(fieldValue, InteractiveAnswersValidator.validateScriptId);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async promptSelectObjectTypesQuestion(): Promise<string[] | undefined> {
		return window.showQuickPick(
			objectTypes.map((objectType) => objectType.value.type),
			{
				placeHolder: this.translationService.getMessage(LIST_OBJECTS.QUESTIONS.SELECT_OBJECTS_TYPES),
				canPickMany: true,
			}
		);
	}

	private async promptFilterAppIdQuestion(): Promise<string | undefined> {
		return window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder: this.translationService.getMessage(LIST_OBJECTS.QUESTIONS.FILTER_APP_ID),
			canPickMany: false,
		});
	}

	private async promptAppIdQuestion(projectInfoService: typeof ProjectInfoService): Promise<string | undefined> {
		const defaultAppId = projectInfoService.getApplicationId();
		let appId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(LIST_OBJECTS.QUESTIONS.APP_ID, defaultAppId),
			validateInput: (fieldValue) => {
				if (fieldValue === '') {
					return null;
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

}
