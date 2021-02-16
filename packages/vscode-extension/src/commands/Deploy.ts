/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window, QuickPickItem } from 'vscode';
import { COMMAND, DEPLOY, YES, NO } from '../service/TranslationKeys';
import { ApplicationConstants, ProjectInfoServive, actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { EOL } from 'os';

const COMMAND_NAME = 'deploy';

const DEPLOY_COMMAND = {
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

export default class Deploy extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		let projectType: string;

		try {
			projectType = this.getProjectType();
		} catch (error) {
			// if error is of "type" CLIException it will have getErrorMessage(), if not just use toString()
			const errorMessage = typeof error.getErrorMessage === 'function' ? error.getErrorMessage() : error.toString();
			this.vsConsoleLogger.error(errorMessage + EOL);
			this.messageService.showCommandError();
			return;
		}

		const deployOptions: { [key: string]: string } = {};

		if (projectType === ApplicationConstants.PROJECT_ACP) {
			const selection = await this.getAccountSpecificValuesOption();
			if (selection === undefined) return;
			deployOptions[DEPLOY_COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] = selection;
		} else if (projectType === ApplicationConstants.PROJECT_SUITEAPP) {
			const selection = await this.getApplyInstallationPrefsOption();
			if (selection === undefined) return;
			deployOptions[DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFS] = selection;
		} else {
			// it should had failed before at catch block
			throw 'Unexpected error while reading manifest.xml';
		}

		const commandActionPromise = this.runSuiteCloudCommand(deployOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage: string = this.translationService.getMessage(DEPLOY.DEPLOYING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}

	private getProjectType(): string {
		const projectInfoService = new ProjectInfoServive(this.getProjectFolderPath());

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
				label: this.translationService.getMessage(NO),
				value: '',
				picked: true,
			},
			{
				label: this.translationService.getMessage(YES),
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
