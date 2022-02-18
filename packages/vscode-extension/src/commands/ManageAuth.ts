import { QuickPickItem, window } from 'vscode';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { MANAGE_ACCOUNTS, MANAGE_AUTH } from '../service/TranslationKeys';
import { ActionResult, AuthListData } from '../types/ActionResult';
import { AccountCredentialsFormatter, AuthenticationUtils } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

interface SelectAuthIdItem extends QuickPickItem {
	authId: string;
}

interface SelectManageOption extends QuickPickItem {
	manageOption: ManageOption;
}

enum ManageOption {
	INFO,
	RENAME,
	REMOVE,
}

const COMMAND_NAME = 'manageauth';

export default class ManageAuth extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute(): Promise<void> {
		const accountsPromise = AuthenticationUtils.getAuthIds(getSdkPath());
		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.LOADING), true, accountsPromise);
		const actionResult: ActionResult<AuthListData> = await accountsPromise;

		if (actionResult.isSuccess()) {
			const selectedAuhtID = await this.showAuthList(actionResult.data);
			if (!selectedAuhtID) {
				return;
			}
			window.showInformationMessage(selectedAuhtID.label);

			const selectedOption = await this.showManagaAuthOptions(selectedAuhtID);
			if (!selectedOption) {
				return;
			}
			window.showInformationMessage(selectedOption.label);

			if (selectedOption.manageOption === ManageOption.INFO) {
				// show info
				this.showInfo(selectedAuhtID, actionResult.data)
			} else if (selectedOption.manageOption === ManageOption.RENAME) {
				// rename authid
			} else if (selectedOption.manageOption === ManageOption.REMOVE) {
				// remove authid
			}
		} else {
			this.vsConsoleLogger.error(actionResult.errorMessages[0]);
			this.messageService.showCommandError();
		}
		return;
	}

	private async showAuthList(data: AuthListData) {
		return window.showQuickPick(this.getAuthOptions(data), {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.SELECT_AUTH_ID),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private getAuthOptions(authData: AuthListData): SelectAuthIdItem[] {
		const options: SelectAuthIdItem[] = [];
		Object.keys(authData).forEach((authId) => {
			options.push({
				label: `${authId} | ${authData[authId].accountInfo.roleName} @ ${authData[authId].accountInfo.companyName}`,
				authId: authId,
			});
		});
		return options;
	}

	private async showManagaAuthOptions(selectedAuhtID: SelectAuthIdItem) {
		const options: SelectManageOption[] = [
			{ label: `Show Details for ${selectedAuhtID.authId}`, manageOption: ManageOption.INFO },
			{ label: `Rename  ${selectedAuhtID.authId}`, manageOption: ManageOption.RENAME },
			{ label: `Remove ${selectedAuhtID.authId}`, manageOption: ManageOption.REMOVE },
		];
		return window.showQuickPick(options, {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.SELECT_MANAGE_OPTION),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private showInfo(selectedAuhtID: SelectAuthIdItem, authList: AuthListData ) {
		this.messageService.showCommandInfo('To see the details from your AuthId')
		const authIDInfo = authList[selectedAuhtID.authId] 
		// `Authentication ID (authID): NodeCli_Automation
		// Account Name: Master Wolfe Canada
		// Account ID: MSTRWLFCANADA
		// Role: Administrator
		// Domain: jbalbas-restricted-201-euf1-001.eng.netsuite.com
		// Account Type: Production`

		const accountCredentials = authIDInfo as any;
		accountCredentials.authId = selectedAuhtID.authId;
		accountCredentials.domain = authIDInfo.urls.app

		const infoMessage = AccountCredentialsFormatter.getInfoString(authIDInfo);
		
		this.vsConsoleLogger.info(infoMessage)
	}
}
