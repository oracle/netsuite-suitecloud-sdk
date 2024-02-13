import * as vscode from 'vscode';
import { AuthenticationUtils } from '../util/ExtensionUtil';
import MessageService from './MessageService';
import { LIST_AUTH } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { AuthListData } from '../types/ActionResult';
import { showSetupAccountWarningMessage } from '../startup/ShowSetupAccountWarning';

export interface AuthIdItem extends vscode.QuickPickItem {
	authId: string;
}

export default class ListAuthService {
	private readonly messageService: MessageService;
	private readonly translationService: VSTranslationService;
	private rootProjectFolder?: string;

	constructor(messageService: MessageService, translationService: VSTranslationService, rootProjectFolder?: string) {
		this.messageService = messageService;
		this.translationService = translationService;
		this.rootProjectFolder = rootProjectFolder;
	}

	public async getAuthIds(showWarning: boolean = true): Promise<AuthListData | void> {
		const authIdsPromise = AuthenticationUtils.getAuthIds(getSdkPath());
		const statusBarMessage = this.translationService.getMessage(LIST_AUTH.LOADING);
		this.messageService.showStatusBarMessage(statusBarMessage, true, authIdsPromise);
		const authIdsResult = await authIdsPromise;

		if (authIdsResult.isSuccess()) {
			const authIds: AuthListData = authIdsResult.data;
			if (Object.keys(authIds).length === 0 && showWarning) {
				showSetupAccountWarningMessage();
				return;
			}
			return authIds;
		}
		else {
			throw authIdsResult.errorMessages;
		}
	}

	public async selectAuthId(authIds: AuthListData) {
		const defaultAuthId = this.getDefaultAuthId();

		const options = Object.entries(authIds).map<AuthIdItem>(([authId, info]) => ({
			label: `${authId} | ${info.accountInfo.roleName} @ ${info.accountInfo.companyName}`,
			description: defaultAuthId && defaultAuthId === authId ? "(default)" : "",
			authId,
		}));

		options.sort((a, b) => (a.description || "") > (b.description || "") ? -1 : 1);

		return vscode.window.showQuickPick(options, {
			placeHolder: this.translationService.getMessage(LIST_AUTH.SELECT),
			ignoreFocusOut: true,
			canPickMany: false,
		});
	}

	private getDefaultAuthId() {
		try {
			return AuthenticationUtils.getProjectDefaultAuthId(this.rootProjectFolder);
		} catch(e) {
			return undefined;
		}
	}
}