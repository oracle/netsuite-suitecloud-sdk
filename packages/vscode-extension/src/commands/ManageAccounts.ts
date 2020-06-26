/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import {
	actionResultStatus,
	AuthenticationUtils,
	showValidationResults,
	validateAuthIDNotInList,
	validateFieldIsNotEmpty,
	validateFieldHasNoSpaces,
	validateAlphanumericHyphenUnderscore,
	validateMaximumLength,
} from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { window, QuickPickItem } from 'vscode';
import { AuthListData, ActionResult } from '../types/ActionResult';
import { sdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS, COMMAND } from '../service/TranslationKeys';

const COMMAND_NAME = 'account:setup';

enum AuthIdListOption {
	new,
	select,
}

enum NewAuthIdOption {
	browser,
	savetoken,
}

interface NewAuthIdItem extends QuickPickItem {
	option: AuthIdListOption.new;
}

interface SelectAuthIdItem extends QuickPickItem {
	option: AuthIdListOption.select;
	authId: string;
}

type AuthIdItem = NewAuthIdItem | SelectAuthIdItem;

interface NewAuthIDBrowser extends QuickPickItem {
	option: NewAuthIdOption.browser;
}
interface NewAuthIDSaveToken extends QuickPickItem {
	option: NewAuthIdOption.savetoken;
}

type SelectNewAuthIdItems = NewAuthIDBrowser | NewAuthIDSaveToken;

export default class ManageAccounts extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
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
			} else if (selected.option === AuthIdListOption.new) {
				this.handleNewAuth(actionResult.data);
			} else if (selected.option === AuthIdListOption.select) {
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
			canPickMany: false,
		});
	}

	private getAuthOptions(authData: AuthListData): AuthIdItem[] {
		let options: AuthIdItem[] = [
			{
				option: AuthIdListOption.new,
				label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE_NEW_AUTHID),
			},
		];
		Object.keys(authData).forEach((authId) => {
			options.push({
				option: AuthIdListOption.select,
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
		} else if (selected.option === NewAuthIdOption.browser) {
			this.handleBrowserAuth(accountCredentialsList);
		} else if (selected.option === NewAuthIdOption.savetoken) {
			this.handleSaveToken();
		}
	}

	private async getNewAuthIdOption() {
		if (!this.executionPath) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}
		try {
			let options: SelectNewAuthIdItems[] = [
				{
					option: NewAuthIdOption.browser,
					label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.BROWSER),
				},
				{
					option: NewAuthIdOption.savetoken,
					label: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.SAVE_TOKEN),
				},
			];
			return await window.showQuickPick(options, {
				placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.CREATE_NEW_AUTHID),
				canPickMany: false,
			});
		} catch (e) {
			this.messageService.showErrorMessage(e);
		}
	}

	private async handleBrowserAuth(accountCredentialsList: AuthListData) {
		let authID = await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_ACCOUNTS.CREATE.ENTER_AUTH_ID), //Enter an authentication ID (authID provided by you to identify the credentials for your convenience)
			validateInput: (fieldValue) =>
				showValidationResults(
					fieldValue,
					validateFieldIsNotEmpty,
					validateFieldHasNoSpaces,
					validateAuthIDNotInList(fieldValue, Object.keys(accountCredentialsList)),
					validateAlphanumericHyphenUnderscore,
					validateMaximumLength
				),
		});

		const commandActionPromise = this.runSuiteCloudCommand();
		const commandMessage = this.translationService.getMessage(
			COMMAND.TRIGGERED,
			this.translationService.getMessage(MANAGE_ACCOUNTS.AUTHENTICATING)
		);
		const statusBarMessage: string = this.translationService.getMessage(MANAGE_ACCOUNTS.AUTHENTICATING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const commandParams = {
			authId: authID,
		};
		// if (params.url) {
		// 	commandParams.url = params.url;
		// }

		const actionResult: ActionResult<any> = await AuthenticationUtils.oauth(commandParams, sdkPath);
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}

	private async handleSaveToken() {
		this.messageService.showStatusBarMessage(`action not implemented`);
	}

	private handleSelectedAuth(authId: string) {
		if (!this.executionPath) {
			this.messageService.showErrorMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.ERROR.NOT_IN_PROJECT));
			return;
		}
		try {
			AuthenticationUtils.setDefaultAuthentication(this.executionPath, authId);
			this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.SUCCESS, authId));
			return;
		} catch (e) {
			this.messageService.showErrorMessage(e);
		}
	}
}
