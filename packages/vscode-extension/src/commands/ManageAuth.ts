import { QuickPickItem, window } from 'vscode';
import { COMMAND, MANAGE_AUTH } from '../service/TranslationKeys';
import { AuthListData, ValidationResult } from '../types/ActionResult';
import { AccountCredentialsFormatter, actionResultStatus, InteractiveAnswersValidator } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import ListAuthService, { AuthIdItem } from '../service/ListAuthService';

interface ManageAuthOptionItem extends QuickPickItem {
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

		const listAuthService = new ListAuthService(this.messageService, this.translationService, this.rootWorkspaceFolder);

		const authIds = await listAuthService.getAuthIds();
		if(!authIds) {
			return;
		}

		const selectedAuthID = await listAuthService.selectAuthId(authIds);
		if (!selectedAuthID) {
			return;
		}

		const selectedManageAuthOption = await this.showManageAuthOptions(selectedAuthID);
		if (!selectedManageAuthOption) {
			return;
		}

		if (selectedManageAuthOption.manageOption === ManageAuthOption.INFO) {
			this.showInfo(selectedAuthID, authIds);
		} else if (selectedManageAuthOption.manageOption === ManageAuthOption.RENAME) {
			this.renameAuthId(selectedAuthID, authIds);
		} else if (selectedManageAuthOption.manageOption === ManageAuthOption.REMOVE) {
			this.removeAuthId(selectedAuthID);
		}
		return;
	}

	private async showManageAuthOptions(selectedAuthID: AuthIdItem) {
		const options: ManageAuthOptionItem[] = [
			{ label: this.translationService.getMessage(MANAGE_AUTH.GENERAL.INFO_OPTION), manageOption: ManageAuthOption.INFO },
			{ label: this.translationService.getMessage(MANAGE_AUTH.GENERAL.RENAME_OPTION), manageOption: ManageAuthOption.RENAME },
			{ label: this.translationService.getMessage(MANAGE_AUTH.GENERAL.REMOVE_OPTION), manageOption: ManageAuthOption.REMOVE },
		];
		return window.showQuickPick(options, {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.GENERAL.SELECT_OPTION_FOR_AUTH_ID, selectedAuthID.authId),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private showInfo(selectedAuthID: AuthIdItem, authList: AuthListData) {
		const authIDInfo = authList[selectedAuthID.authId];
		const accountCredentials = authIDInfo as any;
		accountCredentials.authId = selectedAuthID.authId;
		accountCredentials.domain = authIDInfo.urls.app;
		const authIDInfoMessage = AccountCredentialsFormatter.getInfoString(authIDInfo);

		this.messageService.showCommandInfo(undefined, false);
		this.vsConsoleLogger.info(authIDInfoMessage);
		this.vsConsoleLogger.info('');
	}

	private async renameAuthId(selectedAuthID: AuthIdItem, authIds: AuthListData) {
		const newAuthID = await window.showInputBox({
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.RENAME.ENTER_NEW_AUTH_ID),
			validateInput: (fieldValue: string) => {
				const validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateFieldHasNoSpaces,
					(fieldValue: string) => InteractiveAnswersValidator.validateSameAuthID(fieldValue, selectedAuthID.authId),
					(fieldValue: string) => InteractiveAnswersValidator.validateAuthIDNotInList(fieldValue, Object.keys(authIds)),
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscore,
					InteractiveAnswersValidator.validateMaximumLength
				);
				return typeof validationResult === 'string' ? validationResult : '';
			},
		});
		if (!newAuthID) {
			return;
		}

		const commandOptions: { [option: string]: string } = {};
		commandOptions.rename = selectedAuthID.authId;
		commandOptions.renameto = newAuthID;
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

	private async removeAuthId(selectedAuthID: AuthIdItem) {
		const REMOVE_ANSWER = {
			CONTINUE: this.translationService.getMessage(MANAGE_AUTH.REMOVE.CONTINUE),
			CANCEL: this.translationService.getMessage(MANAGE_AUTH.REMOVE.CANCEL),
		};
		const removeAnswer = await window.showQuickPick([REMOVE_ANSWER.CONTINUE, REMOVE_ANSWER.CANCEL], {
			placeHolder: this.translationService.getMessage(MANAGE_AUTH.REMOVE.CONFIRMATION_MESSAGE, selectedAuthID.authId),
			ignoreFocusOut: true,
			canPickMany: false,
		});

		if (!removeAnswer || removeAnswer === REMOVE_ANSWER.CANCEL) {
			return;
		}

		if (removeAnswer === REMOVE_ANSWER.CONTINUE) {
			const commandOptions: { [option: string]: string } = {};
			commandOptions.remove = selectedAuthID.authId;

			const renameAuthIDActionPromise = this.runSuiteCloudCommand(commandOptions, NON_EXISTING_PATH);
			const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
			const statusBarMessage = this.translationService.getMessage(MANAGE_AUTH.REMOVE.REMOVING_AUTH_ID);
			this.messageService.showInformationMessage(commandMessage, statusBarMessage, renameAuthIDActionPromise, true, false);

			const renameAuthIDActionResult = await renameAuthIDActionPromise;
			if (renameAuthIDActionResult.status === actionResultStatus.SUCCESS) {
				this.messageService.showCommandInfo(undefined, false);
			} else {
				this.messageService.showCommandError(undefined, false);
			}
		}
	}
}
