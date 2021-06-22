/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { FolderItem } from '../types/FolderItem';
import { AccountFileCabinetService, actionResultStatus, ExecutionEnvironmentContext, getRootProjectFolder } from '../util/ExtensionUtil';
import MessageService from './MessageService';
import { COMMAND, LIST_FILES } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';

const LIST_FILES_COMMAND = {
	OPTIONS: {
		FOLDER: 'folder',
	},
};

const SUITECLOUD_COMMAND_NAME = 'file:list';
const COMMAND_NAME_LIST_FILES = 'listfiles';
const COMMAND_NAME_LIST_FOLDERS = 'listfolders';
const CONSOLE_LOGGER_ERROR = 'vsConsole Logger not initialized';

export default class ListFilesService {
	private readonly translationService: VSTranslationService;
	private executionPath?: string;
	private readonly messageService: MessageService;
	private vsConsoleLogger: VSConsoleLogger | undefined;

	constructor(messageService: MessageService, translationService: VSTranslationService) {
		this.messageService = messageService;
		this.translationService = translationService;
		this.executionPath = getRootProjectFolder();
	}

	public async getListFolders() {
		const executionEnvironmentContext = new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});

		const listFoldersPromise = AccountFileCabinetService.getFileCabinetFolders(
			getSdkPath(),
			executionEnvironmentContext,
			this.executionPath,
			COMMAND_NAME_LIST_FOLDERS
		);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LOADING_FOLDERS);
		this.messageService.showStatusBarMessage(statusBarMessage, listFoldersPromise);

		let fileCabinetFolders: FolderItem[] = await listFoldersPromise;

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
				return { label: folder.path, description };
			}),
			{
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(LIST_FILES.SELECT_FOLDER),
				canPickMany: false,
			}
		);
	}

	public async selectFiles(files: string[]): Promise<vscode.QuickPickItem[] | undefined> {
		return vscode.window.showQuickPick(
			files.map((file: string) => {
				const description = file ? this.translationService.getMessage(LIST_FILES.RESTRICTED_FOLDER) : '';
				return { label: file, description };
			}),
			{
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(LIST_FILES.SELECT_FOLDER),
				canPickMany: true,
			}
		);
	}

	public async listFiles(selectedFolder: string) {
		const listfilesOptions: { [key: string]: string } = {};
		listfilesOptions[LIST_FILES_COMMAND.OPTIONS.FOLDER] = selectedFolder;

		const commandActionPromise = this.listFilesCommand(listfilesOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, COMMAND_NAME_LIST_FILES);
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
			commandName: SUITECLOUD_COMMAND_NAME,
			arguments: listFilesOption,
		});

		this.vsConsoleLogger.info('');

		return suiteCloudRunnerRunResult;
	}

	setVsConsoleLogger(vsConsoleLogger: VSConsoleLogger) {
		this.vsConsoleLogger = vsConsoleLogger;
	}
}
