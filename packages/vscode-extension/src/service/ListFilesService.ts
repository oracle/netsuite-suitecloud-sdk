/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import { FolderItem } from '../types/FolderItem';
import {
	AccountFileCabinetService,
	actionResultStatus,
	AuthenticationUtils,
	ConsoleLogger,
	ExecutionEnvironmentContext,
} from '../util/ExtensionUtil';
import MessageService from './MessageService';
import { COMMAND, EXTENSION_INSTALLATION, IMPORT_FILES, LIST_FILES } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import { commandsInfoMap } from '../commandsMap';

const LIST_FILES_COMMAND = {
	OPTIONS: {
		FOLDER: 'folder',
	},
};

const CONSOLE_LOGGER_ERROR = 'vsConsole Logger not initialized';

export default class ListFilesService {
	private readonly translationService: VSTranslationService;
	private executionPath?: string;
	private readonly messageService: MessageService;
	private vsConsoleLogger: typeof ConsoleLogger | undefined;

	constructor(messageService: MessageService, translationService: VSTranslationService, projectFolder: string | undefined) {
		this.messageService = messageService;
		this.translationService = translationService;
		this.executionPath = projectFolder;
	}

	public async getListFolders(): Promise<FolderItem[] | undefined> {
		const executionEnvironmentContext = new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});

		let defaultAuthId: string | undefined;
		try {
			defaultAuthId = AuthenticationUtils.getProjectDefaultAuthId(this.executionPath);
		} catch (error) {
			defaultAuthId = undefined;
		}

		if (!defaultAuthId) {
			const runSetupAccountMessage = this.translationService.getMessage(
				EXTENSION_INSTALLATION.PROJECT_STARTUP.BUTTONS.RUN_SUITECLOUD_SETUP_ACCOUNT
			);

			vscode.window
				.showWarningMessage(
					this.translationService.getMessage(EXTENSION_INSTALLATION.PROJECT_STARTUP.MESSAGES.PROJECT_NEEDS_SETUP_ACCOUNT),
					runSetupAccountMessage
				)
				.then((result) => {
					if (result === runSetupAccountMessage) {
						vscode.commands.executeCommand(commandsInfoMap.setupaccount.vscodeCommandId);
					}
				});

			return;
		}

		const accountFileCabinetService = new AccountFileCabinetService(getSdkPath(), executionEnvironmentContext, defaultAuthId);
		const listFoldersPromise = accountFileCabinetService.getAccountFileCabinetFolders();
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LOADING_FOLDERS);
		this.messageService.showStatusBarMessage(statusBarMessage, listFoldersPromise);

		const fileCabinetFolders = await listFoldersPromise;

		return this._sortFolders(fileCabinetFolders);
	}

	private _sortFolders(fileCabinetFolders: FolderItem[]) {
		fileCabinetFolders = fileCabinetFolders.sort((folder1, folder2) => {
			if (folder1.isRestricted && !folder2.isRestricted) {
				return 1;
			}

			if (!folder1.isRestricted && folder2.isRestricted) {
				return -1;
			}

			return 0;
		});
		return fileCabinetFolders;
	}

	public async selectFolder(folders: FolderItem[]): Promise<vscode.QuickPickItem | undefined> {
		return vscode.window.showQuickPick(
			folders.map((folder: FolderItem) => {
				const description = folder.isRestricted ? this.translationService.getMessage(LIST_FILES.RESTRICTED_FOLDER) : '';
				return { label: folder.path, description, detail: path.basename(folder.path) };
			}),
			{
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(LIST_FILES.SELECT_FOLDER),
				canPickMany: false,
				onDidSelectItem: (item: vscode.QuickPickItem) => vscode.window.setStatusBarMessage(item.label, 5000),
			}
		);
	}

	public async selectFiles(files: string[]): Promise<vscode.QuickPickItem[] | undefined> {
		let finish: boolean = false;
		let message = this.translationService.getMessage(LIST_FILES.SELECT_FOLDER);
		while (!finish) {
			const selectedFiles = await vscode.window.showQuickPick(
				files.map((file: string) => {
					const description = file ? this.translationService.getMessage(IMPORT_FILES.QUESTIONS.SELECT_FILES) : '';
					return { label: file, description };
				}),
				{
					ignoreFocusOut: true,
					placeHolder: message,
					canPickMany: true,
				}
			);
			if (!selectedFiles || selectedFiles.length > 0) {
				finish = true;
				return selectedFiles;
			}
			message = this.translationService.getMessage(IMPORT_FILES.QUESTIONS.CHOOSE_OPTION);
		}

		return;
	}

	public async listFiles(selectedFolder: string) {
		const listfilesOptions: { [key: string]: string } = {};
		listfilesOptions[LIST_FILES_COMMAND.OPTIONS.FOLDER] = selectedFolder;

		const commandActionPromise = this.listFilesCommand(listfilesOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, commandsInfoMap.listfiles.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LISTING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			return actionResult.data;
		} else {
			throw actionResult.errorMessages;
		}
	}

	private async listFilesCommand(listFilesOption: { [key: string]: string }) {
		if (!this.vsConsoleLogger) {
			throw Error(CONSOLE_LOGGER_ERROR);
		}
		const suiteCloudRunnerRunResult = await new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
			commandName: commandsInfoMap.listfiles.cliCommandName,
			arguments: listFilesOption,
		});

		this.vsConsoleLogger.info('');

		return suiteCloudRunnerRunResult;
	}

	setVsConsoleLogger(vsConsoleLogger: typeof ConsoleLogger) {
		this.vsConsoleLogger = vsConsoleLogger;
	}
}
