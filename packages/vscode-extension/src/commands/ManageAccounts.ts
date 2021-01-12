/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { actionResultStatus, AuthenticationUtils, InteractiveAnswersValidator, ApplicationConstants } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { window, QuickPickItem, MessageItem } from 'vscode';
import { AuthListData, ActionResult, AuthenticateActionResult } from '../types/ActionResult';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS, DISMISS } from '../service/TranslationKeys';
import { PRODUCTION_DOMAIN_REGEX, PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX } from '../ApplicationConstants'

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

	constructor() {
		super(COMMAND_NAME);

		this.vsConsoleLogger = new VSConsoleLogger(true, this.executionPath);
	}

	protected validate(): { valid: true } {
		// ManageAccount can be executed anywhere. We don't need to be in a project folder
		return {
			valid: true,
		};
	}

	protected async execute() {
        this.vsConsoleLogger.addExecutionDetailsToLog();

		const accountsPromise = AuthenticationUtils.getAuthIds(getSdkPath());
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
		if (!authId) {
			return;
		}
		const url = await this.getUrl();
		const commandParams: { authid: string; dev: boolean; url?: string } = {
			authid: authId,
			dev: false,
		};
		if (url === undefined) {
			return;
		}
		if (url) {
			commandParams.url = url;
			commandParams.dev = !url.match(PRODUCTION_DOMAIN_REGEX) && !url.match(PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX);
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
		this.handleAuthenticateActionResult(actionResult);
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
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					InteractiveAnswersValidator.validateNonProductionDomain,
					InteractiveAnswersValidator.validateNonProductionAccountSpecificDomain
				);
				if (!fieldValue) {
					fieldValue = ApplicationConstants.PROD_ENVIRONMENT_ADDRESS
				}
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

		const tokenId = await this.getTokenId();
		if (!tokenId) {
			return;
		}

		const tokenSecret = await this.getTokenSecret();
		if (!tokenSecret) {
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
			commandParams.dev = !url.match(PRODUCTION_DOMAIN_REGEX) && !url.match(PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX);
		}

		const saveTokenPromise = AuthenticationUtils.saveToken(commandParams, getSdkPath(), this.executionPath);
		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.SAVING_TBA), true, saveTokenPromise);

		const actionResult: AuthenticateActionResult = await saveTokenPromise;
		this.handleAuthenticateActionResult(actionResult);
	}

	private handleAuthenticateActionResult(actionResult: AuthenticateActionResult): void {
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.vsConsoleLogger.result(
				this.translationService.getMessage(
					MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.SUCCESS.NEW_TBA,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName,
					actionResult.authId
				)
			);
			this.messageService.showCommandInfo(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, actionResult.authId));
		} else {
			actionResult.errorMessages.forEach((e) => this.vsConsoleLogger.error(e));
			this.messageService.showCommandError();
		}

		this.vsConsoleLogger.info("");
	}

	private handleSelectedAuth(authId: string) {
		if (!this.executionPath) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}

		try {
			AuthenticationUtils.setDefaultAuthentication(this.executionPath, authId);
			this.vsConsoleLogger.result(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, authId));
			this.messageService.showCommandInfo(this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_AUTH_ID.SUCCESS, authId));
		} catch (e) {
			this.messageService.showErrorMessage(e);
		}

		this.vsConsoleLogger.info("");
	}
}
