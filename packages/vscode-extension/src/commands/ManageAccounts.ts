/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { COMMAND } from '../service/TranslationKeys';
import { actionResultStatus, AuthenticationService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { window, QuickPickItem } from 'vscode';
import { AuthListData, ActionResult } from '../types/ActionResult';

enum AuthIdListOption {
	new,
	select
}
interface AuthIdItem extends QuickPickItem {
	option: AuthIdListOption;
	authId?: string;
}

export default class ManageAccounts extends BaseAction {
	
	constructor() {
		super('account:setup');
	}

	protected validate() {
		return {
			valid: true,
			message: ''
		}
	}

	protected async execute() {

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, `Account:setup`);

		const commandActionPromise = this.runSubCommand({});
		this.messageService.showInformationMessage(commandMessage);

		const actionResult: ActionResult<AuthListData> = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			const selected = await this.getAuthListOption(actionResult.data);
			if (!selected) {
				this.messageService.showInformationMessage(`action canceled`);
				return;
			}
			else if (selected.option === AuthIdListOption.new) {
				this.messageService.showInformationMessage(`action not implemented`);
				return;
			}
			else if (selected.option === AuthIdListOption.select) {
				if (!this.executionPath) {
					this.messageService.showErrorMessage(`Can't set the default authId if not in a project`);
					return;
				}
				new AuthenticationService().setDefaultAuthentication(this.executionPath, selected.authId);
			}
		} else {
			this.messageService.showCommandError();
		}
		return;
	}

	private async getAuthListOption(data: AuthListData) {
		return await window.showQuickPick(this.getAuthOptions(data), {
			placeHolder: this.translationService.getMessage('Available connections'),
			canPickMany: false,
		});
	}

	private getAuthOptions(authData: AuthListData): AuthIdItem[] {

		let options: AuthIdItem[] = [{
			option: AuthIdListOption.new,
			label: `Add Account (Fake Option - No action for now)`
		}];
		Object.keys(authData).forEach(authId => {
			options.push({
				option: AuthIdListOption.select,
				label: `${authId} | ${authData[authId].accountInfo.roleName} @ ${authData[authId].accountInfo.companyName}`,
				authId: authId,
			})
		})
		return options;
	}
}
