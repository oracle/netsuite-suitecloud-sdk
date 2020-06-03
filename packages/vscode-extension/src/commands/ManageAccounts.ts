/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { actionResultStatus, AuthenticationUtils } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { window, QuickPickItem } from 'vscode';
import { AuthListData, ActionResult } from '../types/ActionResult';
import { sdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS } from '../service/TranslationKeys';

const COMMAND_NAME = 'account:manageauth';

enum AuthIdListOption {
	new,
	select,
}

interface NewAuthIdItem extends QuickPickItem {
	option: AuthIdListOption.new;
}

interface SelectAuthIdItem extends QuickPickItem {
	option: AuthIdListOption.select;
	authId: string;
}

type AuthIdItem = NewAuthIdItem | SelectAuthIdItem;

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
				this.handleNewAuth();
			} else if (selected.option === AuthIdListOption.select) {
				this.handleSelectedAuth(selected.authId);
			}
		} else {
			this.messageService.showCommandError();
		}
		return;
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

	private handleNewAuth() {
		this.messageService.showStatusBarMessage(`action not implemented`);
	}

	private async getAuthListOption(data: AuthListData) {
		return await window.showQuickPick(this.getAuthOptions(data), {
			placeHolder: this.translationService.getMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.AVAILABLE_CONNECTIONS)),
			canPickMany: false,
		});
	}

	private getAuthOptions(authData: AuthListData): AuthIdItem[] {
		let options: AuthIdItem[] = [
			{
				option: AuthIdListOption.new,
				label: `Add Account (Fake Option - No action for now)`,
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
}
