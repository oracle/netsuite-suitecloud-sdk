/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { ANSWERS, IMPORT_FILES } from '../service/TranslationKeys';
import { actionResultStatus, ProjectInfoService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default abstract class FileImportCommon extends BaseAction {
	protected validateBeforeExecute(calledFromCompareFiles?: boolean) {
		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}

		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());
		if (!calledFromCompareFiles && projectInfoService.isSuiteAppProject()) {
			return this.unsuccessfulValidation(this.translationService.getMessage(IMPORT_FILES.ERROR.IMPORT_TO_SUITEAPP_NOT_ALLOWED));
		}

		return this.successfulValidation();
	}

	protected abstract getSelectedFiles(): Promise<string[] | undefined>;

	protected async execute() {
		let selectedFilesPaths: string[] | undefined;
		try {
			selectedFilesPaths = await this.getSelectedFiles();
		} catch (error: any) {
			this.vsConsoleLogger.error(error);
			this.messageService.showCommandError();
		}

		if (!selectedFilesPaths) {
			return;
		}

		const excludeProperties = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.EXCLUDE_PROPERTIES),
				canPickMany: false,
			}
		);
		if (!excludeProperties) {
			return;
		}

		const override = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.CONTINUE), this.translationService.getMessage(ANSWERS.CANCEL)],
			{
				placeHolder:
					selectedFilesPaths.length > 1
						? this.translationService.getMessage(IMPORT_FILES.QUESTIONS.OVERRIDE)
						: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.OVERRIDE_SINGLE, path.basename(selectedFilesPaths[0])),
				canPickMany: false,
			}
		);

		if (!override) {
			return;
		}
		if (override === this.translationService.getMessage(ANSWERS.CANCEL)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_FILES.PROCESS_CANCELED));
			return;
		}

		const commandArgs = this.getCommandArgs(selectedFilesPaths, excludeProperties);

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		this.messageService.showStatusBarMessage(this.getStatusMessage(), true, commandActionPromise);
		const actionResult = await commandActionPromise;

		this.showOutput(actionResult);
	}

	protected getCommandArgs(
		selectedFilesPaths: string[],
		excludeProperties: string
	): { paths: string[]; excludeproperties?: string; calledfromupdate?: string } {
		return {
			paths: selectedFilesPaths,
			...(excludeProperties === this.translationService.getMessage(ANSWERS.YES) && { excludeproperties: 'true' }),
		};
	}

	protected getStatusMessage() {
		return this.translationService.getMessage(IMPORT_FILES.IMPORTING_FILES);
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			const dataResults: { loaded: boolean; message: string; path: string }[] = actionResult.data.results;
			if (dataResults.some((importResult) => !importResult.loaded)) {
				this.messageService.showCommandWarning();
			} else {
				this.messageService.showCommandInfo();
			}
		} else {
			this.messageService.showCommandError();
		}
	}
}
