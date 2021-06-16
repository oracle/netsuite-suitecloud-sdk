import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { AccountFileCabinetService, ExecutionEnvironmentContext, getRootProjectFolder, TranslationService } from '../util/ExtensionUtil';
import * as vscode from 'vscode';
import { LIST_FILES } from './TranslationKeys';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import MessageService from './MessageService';
import { VSTranslationService } from './VSTranslationService';
import { FolderItem } from '../types/FolderItem';

export default class ListFilesService {
	protected readonly translationService: VSTranslationService;
	protected executionPath?: string;
	protected readonly messageService: MessageService;
	// protected filePath?: string;
	// protected vsConsoleLogger: VSConsoleLogger;

	constructor(
		messageService: MessageService,
		translationService: VSTranslationService
		// vSConsoleLogger: VSConsoleLogger,
		// fsPath: string | undefined
	) {
		this.messageService = messageService;
		this.translationService = translationService;
		// this.vsConsoleLogger = vSConsoleLogger;
		// this.executionPath = getRootProjectFolder(fsPath);
		this.executionPath = getRootProjectFolder();
	}

	public async getListFolders(commandName: string) {
		const executionEnvironmentContext = new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});

		const listFoldersPromise = AccountFileCabinetService.getFileCabinetFolders(
			getSdkPath(),
			executionEnvironmentContext,
			this.executionPath,
			commandName
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

	// protected async runSuiteCloudCommand(args: { [key: string]: string } = {}) {
	// 	return new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
	// 		commandName: COMMAND_NAME,
	// 		arguments: args,
	// 	});
	// }
}
