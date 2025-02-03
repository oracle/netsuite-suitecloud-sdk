import { commands, QuickPickItem, window } from 'vscode';
import { commandsInfoMap } from '../commandsMap';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { COMMAND, EXTENSION_INSTALLATION, MANAGE_ACCOUNTS, MANAGE_AUTH } from '../service/TranslationKeys';
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
		// do not show project folder name in the console output
		// or in any other info message
		// AuthIDs management is independent from it
		this.vsConsoleLogger.hiddeInitialProjectFolerNameDetails();

		const authIDsMapPromise = AuthenticationUtils.getAuthIds(getSdkPath());
		this.messageService.showStatusBarMessage(this.translationService.getMessage(MANAGE_ACCOUNTS.LOADING), true, authIDsMapPromise);
		const auhtIDsMapResult: ActionResult<AuthListData> = await authIDsMapPromise;

		if (auhtIDsMapResult.isSuccess()) {
			const auhtIDsMap = auhtIDsMapResult.data;
			if (Object.keys(auhtIDsMap).length === 0) {
				this.showNoAccountsWarningMessage();
				return;
			}
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

	private showNoAccountsWarningMessage() {
		const runSetupAccountButtonMessage = this.translationService.getMessage(
			EXTENSION_INSTALLATION.PROJECT_STARTUP.BUTTONS.RUN_SUITECLOUD_SETUP_ACCOUNT,
			commandsInfoMap.setupaccount.vscodeCommandName
		);
		const noAccountWarningMessage = this.translationService.getMessage(
			MANAGE_AUTH.GENERAL.NO_ACCOUNTS_TO_MANAGE,
			commandsInfoMap.setupaccount.vscodeCommandName
		);
		window.showWarningMessage(noAccountWarningMessage, runSetupAccountButtonMessage).then((result) => {
			if (result === runSetupAccountButtonMessage) {
				commands.executeCommand(commandsInfoMap.setupaccount.vscodeCommandId);
			}
		});
	}

	private async showAuthList(authIDsMap: AuthListData) {
		return window.showQuickPick(this.getAuthIDItems(authIDsMap), {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.GENERAL.SELECT_AUTH_ID_TO_MANAGE),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private getAuthIDItems(authIDsMap: AuthListData): AuthIdItem[] {
		return Object.keys(authIDsMap).map<AuthIdItem>((authId) => ({
			label: `${authId} | ${authIDsMap[authId].accountInfo.roleName} @ ${authIDsMap[authId].accountInfo.companyName}`,
			authId: authId,
		}));
	}

	private async showManageAuthOptions(selectedAuhtID: AuthIdItem) {
		const options: ManageAuhtOptionItem[] = [
			{ label: this.translationService.getMessage(MANAGE_AUTH.GENERAL.INFO_OPTION), manageOption: ManageAuthOption.INFO },
			{ label: this.translationService.getMessage(MANAGE_AUTH.GENERAL.RENAME_OPTION), manageOption: ManageAuthOption.RENAME },
			{ label: this.translationService.getMessage(MANAGE_AUTH.GENERAL.REMOVE_OPTION), manageOption: ManageAuthOption.REMOVE },
		];
		return window.showQuickPick(options, {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.GENERAL.SELECT_OPTION_FOR_AUTH_ID, selectedAuhtID.authId),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private showInfo(selectedAuhtID: AuthIdItem, authList: AuthListData) {
		const authIDInfo = authList[selectedAuhtID.authId];
		const accountCredentials = authIDInfo as any;
		accountCredentials.authId = selectedAuhtID.authId;
		accountCredentials.domain = authIDInfo.hostInfo.hostName;
		const authIDInfoMessage = AccountCredentialsFormatter.getInfoString(authIDInfo);

		this.messageService.showCommandInfo(undefined, false);
		this.vsConsoleLogger.info(authIDInfoMessage);
		this.vsConsoleLogger.info('');
	}

	private async renameAuthId(selectedAuhtID: AuthIdItem, auhtIDsMap: AuthListData) {
		const newAuhtID = await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.RENAME.ENTER_NEW_AUTH_ID),
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
		const statusBarMessage = this.translationService.getMessage(MANAGE_AUTH.RENAME.RENAMING_AUTH_ID);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, renameActionPromise, true, false);

		const renameActionResult = await renameActionPromise;
		if (renameActionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo(undefined, false);
		} else {
			this.messageService.showCommandError(undefined, false);
		}
	}

	private async removeAuhtId(selectedAuhtID: AuthIdItem) {
		const REMOVE_ANSWER = {
			CONTINUE: this.translationService.getMessage(MANAGE_AUTH.REMOVE.CONTINUE),
			CANCEL: this.translationService.getMessage(MANAGE_AUTH.REMOVE.CANCEL),
		};
		const removeAnswer = await window.showQuickPick([REMOVE_ANSWER.CONTINUE, REMOVE_ANSWER.CANCEL], {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.REMOVE.CONFIRMATION_MESSAGE),
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
			const statusBarMessage = this.translationService.getMessage(MANAGE_AUTH.REMOVE.REMOVING_AUTH_ID);
			this.messageService.showInformationMessage(commandMessage, statusBarMessage, renameAuthIDActionPromise, true, false);

			const renameAuhtIDActionResult = await renameAuthIDActionPromise;
			if (renameAuhtIDActionResult.status === actionResultStatus.SUCCESS) {
				this.messageService.showCommandInfo(undefined, false);
			} else {
				this.messageService.showCommandError(undefined, false);
			}
		}
	}
}
