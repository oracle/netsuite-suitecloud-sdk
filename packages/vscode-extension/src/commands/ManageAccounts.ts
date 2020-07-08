/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { actionResultStatus, AuthenticationUtils, InteractiveAnswersValidator, ApplicationConstants } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { window, QuickPickItem, MessageItem } from 'vscode';
import { AuthListData, ActionResult, AuthenticateActionResult } from '../types/ActionResult';
import { sdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS, DISMISS } from '../service/TranslationKeys';
import VSConsoleLogger from '../loggers/VSConsoleLogger';

const COMMAND_NAME = 'account:setup';

enum UiOption {
	new_authid,
	select_authid,
	new_authid_browser,
	new_authid_save_token,
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
	option: UiOption.new_authid_browser | UiOption.new_authid_save_token;
}

interface CancellationToken {
	cancel?: (x: string) => void;
}

export default class ManageAccounts extends BaseAction {
	private log: VSConsoleLogger;
	constructor() {
		super(COMMAND_NAME);
		this.log = new VSConsoleLogger();
	}

	protected validate(): { valid: true } {
		// ManageAccount can be executed anywhere. We don't need to be in a project folder
		return {
			valid: true,
		};
	}

	protected async execute() {
		const accountsPromise = AuthenticationUtils.getAuthIds(sdkPath);
		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.LOADING), true, accountsPromise);
		const actionResult: ActionResult<AuthListData> = await accountsPromise;

		if (actionResult.status === actionResultStatus.SUCCESS) {
			const selected = await this.getAuthListOption(actionResult.data);
			if (!selected) {
				return;
			} else if (selected.option === UiOption.new_authid) {
				this.handleNewAuth(actionResult.data);
			} else if (selected.option === UiOption.select_authid) {
				this.handleSelectedAuth(selected.authId);
			}
		} else {
			this.messageService.showCommandError();
		}
		return;
	}

	private async getAuthListOption(data: AuthListData) {
		return await window.showQuickPick(this.getAuthOptions(data), {
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
			this.handleBrowserAuth(accountCredentialsList);
		} else if (selected.option === UiOption.new_authid_save_token) {
			this.handleSaveToken(accountCredentialsList);
		}
	}

	private async getNewAuthIdOption() {
		if (!this.executionPath) {
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
					option: UiOption.new_authid_save_token,
					label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.OPTION),
				},
			];
			return await window.showQuickPick(options, {
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.NEW_AUTHID),
				canPickMany: false,
			});
		} catch (e) {
			this.messageService.showErrorMessage(e);
		}
	}

	private async handleBrowserAuth(accountCredentialsList: AuthListData) {
		const authId = await this.getNewAuthId(accountCredentialsList);
		const url = await this.getUrl();
		if (!authId) {
			return;
		}
		const commandParams: { authid: string; dev: boolean; url?: string } = {
			authid: authId,
			dev: false,
		};
		if (url) {
			commandParams.url = url;
			commandParams.dev = url !== ApplicationConstants.PROD_ENVIRONMENT_ADDRESS;
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
			sdkPath,
			this.executionPath,
			cancellationToken
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

		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.CONTINUE_IN_BROWSER), true, authenticatePromise);

		const actionResult = await authenticatePromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.log.result(
				this.translationService.getMessage(
					MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.SUCCESS.NEW_TBA,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName,
					actionResult.authId
				)
			);
			this.messageService.showCommandInfo(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, actionResult.authId));
		} else {
			actionResult.errorMessages.forEach((e) => this.log.error(e));
			this.messageService.showCommandError();
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
		return await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.ENTER_URL),
			ignoreFocusOut: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async getAccountId() {
		return await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.ENTER_ACCOUNT_ID),
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

	private async getTokenId() {
		return await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.ENTER_TOKEN_ID),
			ignoreFocusOut: true,
			password: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue, 
					InteractiveAnswersValidator.validateFieldIsNotEmpty
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async getTokenSecret() {
		return await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.ENTER_TOKEN_SECRET),
			ignoreFocusOut: true,
			password: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue, 
					InteractiveAnswersValidator.validateFieldIsNotEmpty
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async handleSaveToken(accountCredentialsList: AuthListData) {
		const authId = await this.getNewAuthId(accountCredentialsList);
		const url = await this.getUrl();
		const accountId = await this.getAccountId();
		const tokenId = await this.getTokenId();
		const tokenSecret = await this.getTokenSecret();
		if (!authId || !accountId || !tokenId || !tokenSecret) {
			return;
		}
		const commandParams: { authid: string; account: string; tokenid: string; tokensecret: string; dev: boolean; url?: string } = {
			authid: authId,
			dev: false,
			account: accountId,
			tokenid: tokenId,
			tokensecret: tokenSecret
		};
		if (url) {
			commandParams.url = url;
			commandParams.dev = url !== ApplicationConstants.PROD_ENVIRONMENT_ADDRESS;
		}

		const saveTokenPromise = AuthenticationUtils.saveToken(commandParams, sdkPath, this.executionPath);

		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.SAVING_TBA), true, saveTokenPromise);

		const actionResult: AuthenticateActionResult = await saveTokenPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.log.result(
				this.translationService.getMessage(
					MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.SUCCESS.NEW_TBA,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName,
					actionResult.authId
				)
			);
			this.messageService.showCommandInfo(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, actionResult.authId));
		} else {
			actionResult.errorMessages.forEach((e) => this.log.error(e));
			this.messageService.showCommandError();
		}
	}

	private handleSelectedAuth(authId: string) {
		if (!this.executionPath) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}
		try {
			AuthenticationUtils.setDefaultAuthentication(this.executionPath, authId);
			this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, authId));
			return;
		} catch (e) {
			this.messageService.showErrorMessage(e);
		}
	}
}
