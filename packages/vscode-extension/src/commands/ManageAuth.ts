import { QuickPickItem, window } from 'vscode';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { COMMAND, MANAGE_ACCOUNTS, MANAGE_AUTH } from '../service/TranslationKeys';
import { ActionResult, AuthListData, ValidationResult } from '../types/ActionResult';
import { AccountCredentialsFormatter, actionResultStatus, AuthenticationUtils, InteractiveAnswersValidator } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

interface AuthIdItem extends QuickPickItem {
	authId: string;
}

interface ManageAuhtOptionItem extends QuickPickItem {
	manageOption: ManageAuthOption;
}
enum ManageAuthOption {
	INFO,
	RENAME,
	REMOVE,
}

const COMMAND_NAME = 'manageauth';
const NON_EXISTING_PATH = 'nonExistingPath/to/avoid/typeCheck/and/assert/errors';

export default class ManageAuth extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected validateBeforeExecute(): ValidationResult {
		return {
			valid: true,
		};
	}

	protected async execute(): Promise<void> {
		// done to not show project folder name in the output
		// AuthID management is independent from it
		this.vsConsoleLogger.hiddeInitialProjectFolerNameDetails();

		const authIDsMapPromise = AuthenticationUtils.getAuthIds(getSdkPath());
		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.LOADING), true, authIDsMapPromise);
		const auhtIDsMapResult: ActionResult<AuthListData> = await authIDsMapPromise;

		if (auhtIDsMapResult.isSuccess()) {
			const auhtIDsMap = auhtIDsMapResult.data;
			const selectedAuhtID = await this.showAuthList(auhtIDsMap);
			if (!selectedAuhtID) {
				return;
			}

			const selectedManageAuhtOption = await this.showManageAuthOptions(selectedAuhtID);
			if (!selectedManageAuhtOption) {
				return;
			}

			if (selectedManageAuhtOption.manageOption === ManageAuthOption.INFO) {
				this.showInfo(selectedAuhtID, auhtIDsMap);
			} else if (selectedManageAuhtOption.manageOption === ManageAuthOption.RENAME) {
				this.renameAuthId(selectedAuhtID, auhtIDsMap);
			} else if (selectedManageAuhtOption.manageOption === ManageAuthOption.REMOVE) {
				this.removeAuhtId(selectedAuhtID);
			}
		} else {
			this.vsConsoleLogger.error(auhtIDsMapResult.errorMessages[0]);
			this.messageService.showCommandError(undefined, false);
		}
		return;
	}

	private async showAuthList(data: AuthListData) {
		return window.showQuickPick(this.getAuthIDItems(data), {
			placeHolder: "Select the authID you want to manage:",
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private getAuthIDItems(authData: AuthListData): AuthIdItem[] {
		return Object.keys(authData).map<AuthIdItem>((authId) => ({
			label: `${authId} | ${authData[authId].accountInfo.roleName} @ ${authData[authId].accountInfo.companyName}`,
			authId: authId,
		}));
	}

	private async showManageAuthOptions(selectedAuhtID: AuthIdItem) {
		const options: ManageAuhtOptionItem[] = [
			{ label: `Show details`, manageOption: ManageAuthOption.INFO },
			{ label: `Rename`, manageOption: ManageAuthOption.RENAME },
			{ label: `Remove`, manageOption: ManageAuthOption.REMOVE },
		];
		return window.showQuickPick(options, {
			placeHolder: `Select one of the following options for ${selectedAuhtID.authId}:`,
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private showInfo(selectedAuhtID: AuthIdItem, authList: AuthListData) {
		const authIDInfo = authList[selectedAuhtID.authId];
		const accountCredentials = authIDInfo as any;
		accountCredentials.authId = selectedAuhtID.authId;
		accountCredentials.domain = authIDInfo.urls.app;
		const authIDInfoMessage = AccountCredentialsFormatter.getInfoString(authIDInfo);
		
		this.messageService.showCommandInfo(undefined, false);
		this.vsConsoleLogger.info(authIDInfoMessage);
		this.vsConsoleLogger.info('');
	}

	private async renameAuthId(selectedAuhtID: AuthIdItem, auhtIDsMap: AuthListData) {
		const newAuhtID = await window.showInputBox({
			placeHolder: 'Enter the new authID.',
			validateInput: (fieldValue: string) => {
				const validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					(fieldValue: string) => InteractiveAnswersValidator.validateSameAuthID(fieldValue, selectedAuhtID.authId),
					(fieldValue: string) => InteractiveAnswersValidator.validateAuthIDNotInList(fieldValue, Object.keys(auhtIDsMap)),
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscore,
					InteractiveAnswersValidator.validateMaximumLength
				);
				return typeof validationResult === 'string' ? validationResult : '';
			},
		});
		if (!newAuhtID) {
			return;
		}


		const commandOptions: { [option: string]: string } = {};
		commandOptions.rename = selectedAuhtID.authId;
		commandOptions.renameto = newAuhtID;
		const renameActionPromise = this.runSuiteCloudCommand(commandOptions, NON_EXISTING_PATH);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		this.messageService.showInformationMessage(
			commandMessage,
			`Renaming authID...`,
			renameActionPromise,
			true,
			false
		);

		const renameActionResult = await renameActionPromise;
		if (renameActionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo(undefined, false);
		} else {
			this.messageService.showCommandError(undefined, false);
		}
	}

	private async removeAuhtId(selectedAuhtID: AuthIdItem) {
		const REMOVE_ANSWER = {
			CONTINUE: 'Continue',
			CANCEL: 'Cancel',
		};
		const removeAnswer = await window.showQuickPick([REMOVE_ANSWER.CONTINUE, REMOVE_ANSWER.CANCEL], {
			placeHolder: `This authID will be removed locally but still be valid in your account: ${selectedAuhtID.authId}.`,
			ignoreFocusOut: true,
			canPickMany: false,
		});

		if (!removeAnswer || removeAnswer === REMOVE_ANSWER.CANCEL) {
			return;
		}

		if (removeAnswer === REMOVE_ANSWER.CONTINUE) {
			const commandOptions: { [option: string]: string } = {};
			commandOptions.remove = selectedAuhtID.authId;

			const renameAuthIDActionPromise = this.runSuiteCloudCommand(commandOptions, NON_EXISTING_PATH);
			const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
			this.messageService.showInformationMessage(commandMessage, `Removing auhtID...`, renameAuthIDActionPromise, true, false);

			const renameAuhtIDActionResult = await renameAuthIDActionPromise;
			if (renameAuhtIDActionResult.status === actionResultStatus.SUCCESS) {
				this.messageService.showCommandInfo(undefined, false);
			} else {
				this.messageService.showCommandError(undefined, false);
			}
		}
	}
}
