/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window, QuickPickItem } from 'vscode';
import { COMMAND, DEPLOY, VALIDATE, ANSWERS } from '../service/TranslationKeys';
import { ApplicationConstants, ProjectInfoService, actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { EOL } from 'os';

const COMMAND_OPTIONS = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	},
	FLAGS: {
		APPLY_INSTALLATION_PREFS: 'applyinstallprefs',
	},
};

const ACCOUNT_SPECIFIC_VALUES = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

interface commandOption extends QuickPickItem {
	value: string;
}

export default abstract class DeployValidateCommon extends BaseAction {
	private statusBarMessage: string;
	private commandOptions: { [key: string]: string } = {};

	constructor(commandName: 'deploy' | 'validate') {
		super(commandName);
		if (commandName === 'deploy') {
			this.statusBarMessage = this.translationService.getMessage(DEPLOY.DEPLOYING);
		} else {
			this.statusBarMessage = this.translationService.getMessage(VALIDATE.VALIDATING);
			this.commandOptions.server = 'T';
		}
	}

	protected async execute() {
		let projectType: string;

		try {
			projectType = this.getProjectType();
		} catch (error: any) {
			// if error is of "type" CLIException it will have getErrorMessage(), if not just use toString()
			const errorMessage = typeof error.getErrorMessage === 'function' ? error.getErrorMessage() : error.toString();
			this.vsConsoleLogger.error(errorMessage + EOL);
			this.messageService.showCommandError();
			return;
		}

		if (projectType === ApplicationConstants.PROJECT_ACP) {
			const selection = await this.getAccountSpecificValuesOption();
			if (selection === undefined) return;
			this.commandOptions[COMMAND_OPTIONS.OPTIONS.ACCOUNT_SPECIFIC_VALUES] = selection;
		} else if (projectType === ApplicationConstants.PROJECT_SUITEAPP) {
			const selection = await this.getApplyInstallationPrefsOption();
			if (selection === undefined) return;
			this.commandOptions[COMMAND_OPTIONS.FLAGS.APPLY_INSTALLATION_PREFS] = selection;
		} else {
			// it should had failed before at catch block
			throw 'Unexpected error while reading manifest.xml';
		}

		const commandActionPromise = this.runSuiteCloudCommand(this.commandOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		this.messageService.showInformationMessage(commandMessage, this.statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}

	private getProjectType(): string {
		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());
		return projectInfoService.getProjectType();
	}

	private async getAccountSpecificValuesOption(): Promise<string | undefined> {
		const ASVOptions: commandOption[] = [
			{
				label: this.translationService.getMessage(DEPLOY.QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL_PROCESS),
				value: ACCOUNT_SPECIFIC_VALUES.ERROR,
				picked: true,
			},
			{
				label: this.translationService.getMessage(DEPLOY.QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.DISPLAY_WARNING),
				value: ACCOUNT_SPECIFIC_VALUES.WARNING,
			},
		];
		const selection = await window.showQuickPick(ASVOptions, {
			placeHolder: this.translationService.getMessage(DEPLOY.QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
			canPickMany: false,
		});

		return selection ? selection.value : undefined;
	}

	private async getApplyInstallationPrefsOption(): Promise<string | undefined> {
		const applyInstallPrefsOptions: commandOption[] = [
			{
				label: this.translationService.getMessage(ANSWERS.NO),
				value: '',
				picked: true,
			},
			{
				label: this.translationService.getMessage(ANSWERS.YES),
				value: 'any non falsy string',
			},
		];
		const selection = await window.showQuickPick(applyInstallPrefsOptions, {
			placeHolder: this.translationService.getMessage(DEPLOY.QUESTIONS.APPLY_INSTALLATION_PREFERENCES),
			ignoreFocusOut: true,
			canPickMany: false,
		});

		return selection ? selection.value : undefined;
	}
}
