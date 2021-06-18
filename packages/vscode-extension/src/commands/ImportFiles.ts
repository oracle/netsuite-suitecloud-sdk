/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { QuickPickItem, window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import ImportFileService from '../service/ImportFileService';
import ListFilesService from '../service/ListFilesService';
import { ANSWERS, COMMAND, ERRORS, IMPORT_FILES, LIST_FILES } from '../service/TranslationKeys';
import { FolderItem } from '../types/FolderItem';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'importfiles';

const LIST_FILES_COMMAND = {
	OPTIONS: {
		FOLDER: 'folder',
		PATHS: 'paths',
	},
};

export default class ImportFiles extends BaseAction {
	protected filePath: string | undefined;
	private importFileService: ImportFileService;
	private listFilesService: ListFilesService;

	constructor() {
		super(COMMAND_NAME);
		this.importFileService = new ImportFileService(this.messageService, this.translationService, this.filePath);
		this.listFilesService = new ListFilesService(this.messageService, this.translationService);
	}

	protected async execute() {
		const activeFile = window.activeTextEditor?.document.uri.fsPath;

		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const fileName = path.basename(activeFile, '.xml');

		try {
			const fileCabinetFolders: FolderItem[] = await this.listFilesService.getListFolders(COMMAND_NAME);
			const selectedFolder: QuickPickItem | undefined = await this.listFilesService.selectFolder(fileCabinetFolders);
			if (!selectedFolder) {
				return;
			}
			const files = await this.listFiles(selectedFolder.label, COMMAND_NAME);
			const selectedFiles: QuickPickItem[] | undefined = await this.listFilesService.selectFiles(files);

			if (!selectedFiles) {
				this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_FILES.PROCESS_CANCELED));
				return;
			}

			const excludePropertiesOptions = [
				{
					label: this.translationService.getMessage(ANSWERS.YES),
					value: true,
				},
				{
					label: this.translationService.getMessage(ANSWERS.NO),
					value: false,
				},
			];

			const excludeProperties = await vscode.window.showQuickPick(excludePropertiesOptions, {
				placeHolder: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.EXCLUDE_PROPERTIES, fileName),
				canPickMany: false,
			});

			const override = await vscode.window.showQuickPick(
				[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
				{
					placeHolder: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.OVERRIDE, fileName),
					canPickMany: false,
				}
			);

			if (!override || override === this.translationService.getMessage(ANSWERS.NO)) {
				this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_FILES.PROCESS_CANCELED));
				return;
			}

			const destinationFolder = this.executionPath
				? path
						.dirname(activeFile)
						.split(this.executionPath + '\\src')[1]
						.replace('\\', '/')
				: path.dirname(activeFile);

			const selectedFilesPaths: string[] = selectedFiles.map((file) => file.label.replace(/\\/g, '/'));

			let commandArgs: any = { project: destinationFolder, paths: selectedFilesPaths };
			if (excludeProperties &&  excludeProperties.value) {
				commandArgs.excludeproperties = true;
			}

			const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
			const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
			const statusBarMessage: string = this.translationService.getMessage(IMPORT_FILES.IMPORTING_FILE);
			this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

			const actionResult = await commandActionPromise;
			if (actionResult.status === actionResultStatus.SUCCESS) {
				this.messageService.showCommandInfo();
			} else {
				this.messageService.showCommandError();
			}
		} catch (e) {
			this.vsConsoleLogger.error(e);
			this.messageService.showCommandError();
			return;
		}
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			this.messageService.showCommandInfo(this.translationService.getMessage(IMPORT_FILES.FINISHED));
		} else {
			this.messageService.showCommandError();
		}
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		const activeFile = window.activeTextEditor?.document.uri;
		if (!activeFile) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE),
			};
		} else if (!this.executionPath) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_WORKSPACE),
			};
		} else {
			return {
				valid: true,
			};
		}
	}

	public async listFiles(selectedFolder: string, commandName: string) {
		const listfilesOptions: { [key: string]: string } = {};
		listfilesOptions[LIST_FILES_COMMAND.OPTIONS.FOLDER] = selectedFolder;

		const commandActionPromise = this.listFilesCommand(listfilesOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, commandName);
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
		const suiteCloudRunnerRunResult = await new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
			commandName: 'file:list',
			arguments: listFilesOption,
		});

		this.vsConsoleLogger.info('');

		return suiteCloudRunnerRunResult;
	}
}
