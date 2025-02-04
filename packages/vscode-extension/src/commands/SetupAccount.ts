/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { actionResultStatus, AuthenticationUtils, ExecutionEnvironmentContext, InteractiveAnswersValidator, ExecutionContextService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { window, QuickPickItem, MessageItem } from 'vscode';
import { AuthListData, ActionResult, AuthenticateActionResult } from '../types/ActionResult';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS, DISMISS, SETUP_ACCOUNT } from '../service/TranslationKeys';
import { VSCODE_PLATFORM } from '../ApplicationConstants';

const COMMAND_NAME = 'setupaccount';

enum UiOption {
	new_authid,
	select_authid,
	new_authid_browser,
	new_authid_m2m,
	cancel_process,
	dismiss,
}

interface NewAuthIdItem extends QuickPickItem {
	option: UiOption.new_authid;
}

interface SelectAuthIdItem extends QuickPickItem {
	option: UiOption.select_authid;
	authId: string;
}

interface MessageItemWithCode extends MessageItem {
	code: UiOption.cancel_process | UiOption.dismiss;
}

type AuthIdItem = NewAuthIdItem | SelectAuthIdItem;

interface NewAuthID extends QuickPickItem {
	option: UiOption.new_authid_browser | UiOption.new_authid_m2m;
}

interface CancellationToken {
	cancel?: (x: string) => void;
}

export default class SetupAccount extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute(): Promise<void> {
		const accountsPromise = AuthenticationUtils.getAuthIds(getSdkPath());
		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.LOADING), true, accountsPromise);
		const actionResult: ActionResult<AuthListData> = await accountsPromise;
		if (actionResult.isSuccess()) {
			const selected = await this.getAuthListOption(actionResult.data);
			if (!selected) {
				return;
			} else if (selected.option === UiOption.new_authid) {
				await this.handleNewAuth(actionResult.data);
			} else if (selected.option === UiOption.select_authid) {
				this.handleSelectedAuth(selected.authId);
			}
		} else {
			this.vsConsoleLogger.error(actionResult.errorMessages[0]);
			this.messageService.showCommandError();
		}
		return;
	}

	private async getAuthListOption(data: AuthListData) {
		return window.showQuickPick(this.getAuthOptions(data), {
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_CREATE),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private getAuthOptions(authData: AuthListData): AuthIdItem[] {
		let options: AuthIdItem[] = [
			{
				option: UiOption.new_authid,
				label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE_NEW),
			},
		];
		Object.keys(authData).forEach((authId) => {
			options.push({
				option: UiOption.select_authid,
				label: `${authId} | ${authData[authId].accountInfo.roleName} @ ${authData[authId].accountInfo.companyName}`,
				authId: authId,
			});
		});
		return options;
	}

	private async handleNewAuth(accountCredentialsList: AuthListData) {
		const selected = await this.getNewAuthIdOption();
		if (!selected) {
			return;
		} else if (selected.option === UiOption.new_authid_browser) {
			if (this.validateSupportedMode(ExecutionContextService.validateBrowserBasedAuthIsAllowed)) {
				await this.handleBrowserAuth(accountCredentialsList);
			}
		} else if (selected.option === UiOption.new_authid_m2m) {
			if (this.validateSupportedMode(ExecutionContextService.validateMachineToMachineAuthIsAllowed)) {
				await this.handleM2m(accountCredentialsList);
			}
		}
	}

	private validateSupportedMode(validatorFunction: () => void): boolean {
		try {
			validatorFunction();
		} catch (err: any) {
			this.messageService.showErrorMessage(err);
			return false;
		}
		return true;
	}

	private async getNewAuthIdOption() {
		if (!this.rootWorkspaceFolder) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}
		try {
			let options: NewAuthID[] = [
				{
					option: UiOption.new_authid_browser,
					label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.BROWSER),
				},
				{
					option: UiOption.new_authid_m2m,
					label: this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.OPTION),
				},
			];
			return await window.showQuickPick(options, {
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.NEW_AUTHID),
				canPickMany: false,
			});
		} catch (e: any) {
			this.messageService.showErrorMessage(e);
		}
	}

	private async handleBrowserAuth(accountCredentialsList: AuthListData) {
		const authId = await this.getNewAuthId(accountCredentialsList);
		if (!authId) {
			return;
		}
		const url = await this.getUrl();
		const commandParams: { authid: string; url?: string } = {
			authid: authId,
		};
		if (url === undefined) {
			return;
		}
		if (url) {
			commandParams.url = url;
		}

		let cancellationToken: CancellationToken = {};
		const dismissButton: MessageItemWithCode = {
			code: UiOption.dismiss,
			title: this.translationService.getMessage(DISMISS),
		};
		const cancelButton: MessageItemWithCode = {
			code: UiOption.cancel_process,
			title: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.BROWSER_CANCEL),
		};

		// This will start the execution in the background and initialize cancellationToken.cancel method
		const authenticatePromise: Promise<AuthenticateActionResult> = AuthenticationUtils.authenticateWithOauth(
			commandParams,
			getSdkPath(),
			this.rootWorkspaceFolder,
			cancellationToken,
			new ExecutionEnvironmentContext({
				platform: VSCODE_PLATFORM,
				platformVersion: vscode.version,
			}),
		);
		window
			.showInformationMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.CONTINUE_IN_BROWSER), dismissButton, cancelButton)
			.then((x) => {
				if (x?.code === UiOption.cancel_process) {
					if (cancellationToken.cancel) {
						cancellationToken.cancel(this.translationService.getMessage(MANAGE_ACCOUNTS.CANCELED));
					}
				}
			});

		this.messageService.showStatusBarMessage(
			this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.CONTINUE_IN_BROWSER),
			true,
			authenticatePromise
		);

		const actionResult = await authenticatePromise;
		this.handleAuthenticateActionResult(actionResult);

		const warning = ExecutionContextService.getBrowserBasedWarningMessages();
		if (warning) {
			this.messageService.showWarningMessageWithOk(warning);
		}
	}

	private async getNewAuthId(accountCredentialsList: AuthListData) {
		return window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.ENTER_AUTH_ID),
			ignoreFocusOut: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					(fieldValue: string) => InteractiveAnswersValidator.validateAuthIDNotInList(fieldValue, Object.keys(accountCredentialsList)),
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscore,
					InteractiveAnswersValidator.validateMaximumLength
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async getUrl() {
		return window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.ENTER_URL),
			ignoreFocusOut: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					InteractiveAnswersValidator.validateNonProductionDomain,
					InteractiveAnswersValidator.validateNonProductionAccountSpecificDomain
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async getAccountId() {
		return window.showInputBox({
			placeHolder: this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.ENTER.ACCOUNT_ID),
			ignoreFocusOut: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscore
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async getCertificateId() {
		return window.showInputBox({
			placeHolder: this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.ENTER.CERTIFICATE_ID),
			ignoreFocusOut: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async getPrivateKeyFilePath() {
		if (!await window.showQuickPick([this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.SELECT_PRIVATE_KEY_FILE)], {
			placeHolder: this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.SELECT_PRIVATE_KEY_FILE_PLACEHOLDER),
			ignoreFocusOut: true,
			canPickMany: false,
		})) {
			return;
		}

		return window.showOpenDialog({
			title: this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.SELECT_PRIVATE_KEY_FILE),
			canSelectFolders: false,
			canSelectFiles: true,
			canSelectMany: false,
		});
	}

	private async handleM2m(accountCredentialsList: AuthListData) {
		const authId = await this.getNewAuthId(accountCredentialsList);
		if (!authId) {
			return;
		}

		const url = await this.getUrl();
		if (url === undefined) {
			return;
		}

		const accountId = await this.getAccountId();
		if (!accountId) {
			return;
		}

		const certificateId = await this.getCertificateId();
		if (!certificateId) {
			return;
		}

		const privateKeyFilePath = await this.getPrivateKeyFilePath();
		if (!privateKeyFilePath) {
			return;
		}

		const commandParams: { authid: string; account: string; certificateid: string; privatekeypath: string; domain?: string } = {
			authid: authId,
			account: accountId,
			certificateid: certificateId,
			privatekeypath: `"${privateKeyFilePath[0].fsPath}"`,
			domain: url,
		};

		const authenticateCiPromise = AuthenticationUtils.authenticateCi(
			commandParams,
			getSdkPath(),
			this.rootWorkspaceFolder,
			new ExecutionEnvironmentContext({
				platform: VSCODE_PLATFORM,
				platformVersion: vscode.version,
			}),
		);
		this.messageService.showStatusBarMessage(
			this.translationService.getMessage(SETUP_ACCOUNT.CREATE.M2M.AUTHENTICATING),
			true,
			authenticateCiPromise,
		);

		const actionResult: AuthenticateActionResult = await authenticateCiPromise;
		this.handleAuthenticateActionResult(actionResult);
	}

	private handleAuthenticateActionResult(actionResult: AuthenticateActionResult): void {
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.vsConsoleLogger.result(
				this.translationService.getMessage(
					SETUP_ACCOUNT.OUTPUT_NEW_OAUTH,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName,
					actionResult.authId,
				)
			);
			this.messageService.showCommandInfo(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, actionResult.authId));
		} else {
			actionResult.errorMessages.forEach((e) => this.vsConsoleLogger.error(e));
			this.messageService.showCommandError();
		}

		this.vsConsoleLogger.info('');
	}

	private handleSelectedAuth(authId: string) {
		if (!this.rootWorkspaceFolder) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}

		try {
			AuthenticationUtils.setDefaultAuthentication(this.rootWorkspaceFolder, authId);
			this.vsConsoleLogger.result(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, authId));
			this.messageService.showCommandInfo(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, authId));
		} catch (e: any) {
			this.messageService.showErrorMessage(e);
		}

		this.vsConsoleLogger.info('');
	}
}
