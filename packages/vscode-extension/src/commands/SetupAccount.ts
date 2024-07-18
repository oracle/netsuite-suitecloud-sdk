/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { actionResultStatus, AuthenticationUtils, InteractiveAnswersValidator } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { window, QuickPickItem, MessageItem } from 'vscode';
import { AuthListData, AuthenticateActionResult, CancellationToken } from '../types/ActionResult';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS, DISMISS } from '../service/TranslationKeys';
import ListAuthService from '../service/ListAuthService';

const COMMAND_NAME = 'setupaccount';

enum UIOptions {
	NEW_AUTHID,
	SELECT_AUTHID,
	NEW_AUTHID_BROWSER,
	NEW_AUTHID_TOKEN,
	CANCEL,
	DISMISS,
}

interface NewAuthIdItem extends QuickPickItem {
	option: UIOptions.NEW_AUTHID;
}

interface SelectAuthIdItem extends QuickPickItem {
	option: UIOptions.SELECT_AUTHID;
	authId: string;
}

interface MessageItemWithCode extends MessageItem {
	code: UIOptions.CANCEL | UIOptions.DISMISS;
}

type AuthIdItem = NewAuthIdItem | SelectAuthIdItem;

interface NewAuthID extends QuickPickItem {
	option: UIOptions.NEW_AUTHID_BROWSER | UIOptions.NEW_AUTHID_TOKEN;
}

export default class SetupAccount extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute(): Promise<void> {
		const listAuthService = new ListAuthService(this.messageService, this.translationService, this.rootWorkspaceFolder!);

		const authIds = await listAuthService.getAuthIds(false);
		if(!authIds) {
			return;
		}

		const selected = await this.selectAuthId(authIds);
		if (!selected) {
			return;
		} else if (selected.option === UIOptions.NEW_AUTHID) {
			await this.handleNewAuth(authIds);
		} else if (selected.option === UIOptions.SELECT_AUTHID) {
			this.handleSelectedAuth(selected.authId);
		}
	}

	private async selectAuthId(authData: AuthListData) {
		let options: AuthIdItem[] = [
			{
				option: UIOptions.NEW_AUTHID,
				description: "(default)",
				label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE_NEW),
			},
		];
		Object.entries(authData).forEach(([authId, info]) => {
			options.push({
				option: UIOptions.SELECT_AUTHID,
				label: `${authId} | ${info.accountInfo.roleName} @ ${info.accountInfo.companyName}`,
				authId: authId,
			});
		});

		return window.showQuickPick(options, {
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.SELECT_CREATE),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private async handleNewAuth(authIds: AuthListData) {
		const selected = await this.getNewAuthIdOption();
		if (!selected) {
			return;
		} else if (selected.option === UIOptions.NEW_AUTHID_BROWSER) {
			await this.handleBrowserAuth(authIds);
		} else if (selected.option === UIOptions.NEW_AUTHID_TOKEN) {
			await this.handleSaveToken(authIds);
		}
	}

	private async getNewAuthIdOption() {
		if (!this.rootWorkspaceFolder) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}
		try {
			let options: NewAuthID[] = [
				{
					option: UIOptions.NEW_AUTHID_BROWSER,
					label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.BROWSER),
				},
				{
					option: UIOptions.NEW_AUTHID_TOKEN,
					label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.OPTION),
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

	private async handleBrowserAuth(authIds: AuthListData) {
		const authId = await this.getNewAuthId(authIds);
		if (!authId) {
			return;
		}
		const url = await this.getUrl();
		if (url === undefined) {
			return;
		}
		const commandParams = {
			authid: authId,
			url
		};

		let cancellationToken: CancellationToken = {};
		const dismissButton: MessageItemWithCode = {
			code: UIOptions.DISMISS,
			title: this.translationService.getMessage(DISMISS),
		};
		const cancelButton: MessageItemWithCode = {
			code: UIOptions.CANCEL,
			title: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.BROWSER_CANCEL),
		};

		// This will start the execution in the background and initialize cancellationToken.cancel method
		const authenticatePromise: Promise<AuthenticateActionResult> = AuthenticationUtils.authenticateWithOauth(
			commandParams,
			getSdkPath(),
			this.rootWorkspaceFolder!,
			cancellationToken
		);
		window
			.showInformationMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.CONTINUE_IN_BROWSER), dismissButton, cancelButton)
			.then((x) => {
				if (x?.code === UIOptions.CANCEL) {
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
	}

	private async getNewAuthId(authIds: AuthListData) {
		return window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.ENTER_AUTH_ID),
			ignoreFocusOut: true,
			validateInput: (fieldValue) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					(fieldValue: string) => InteractiveAnswersValidator.validateAuthIDNotInList(fieldValue, Object.keys(authIds)),
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
		return window.showInputBox({
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
		return window.showInputBox({
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

	private async handleSaveToken(authIds: AuthListData) {
		const authId = await this.getNewAuthId(authIds);
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

		const commandParams: { authid: string; account: string; tokenid: string; tokensecret: string; url?: string } = {
			authid: authId,
			account: accountId,
			tokenid: tokenId,
			tokensecret: tokenSecret,
		};
		if (url) {
			commandParams.url = url;
		}

		const saveTokenPromise = AuthenticationUtils.saveToken(commandParams, getSdkPath(), this.rootWorkspaceFolder!);
		this.messageService.showStatusBarMessage(
			this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN.SAVING_TBA),
			true,
			saveTokenPromise
		);

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
