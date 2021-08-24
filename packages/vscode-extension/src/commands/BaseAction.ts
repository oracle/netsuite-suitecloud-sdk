/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri, window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import MessageService from '../service/MessageService';
import { COMMAND, ERRORS } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { ApplicationConstants, AuthenticationUtils, CLIConfigurationService } from '../util/ExtensionUtil';
import { commandsInfoMap, CommandsInfoMapType } from '../commandsMap';
import { ActionResult, ValidationResult } from '../types/ActionResult';
import { CommandMetadata } from '../types/Metadata';
import { showSetupAccountWarningMessage } from '../startup/ShowSetupAccountWarning';

export default abstract class BaseAction {
	protected readonly translationService: VSTranslationService;
	protected isSelectedFromContextMenu?: boolean;
	protected readonly messageService: MessageService;
	protected readonly vscodeCommandName: string;
	protected readonly cliCommandName: string;
	protected readonly commandMetadata: CommandMetadata;
	protected rootWorkspaceFolder?: string;
	protected vsConsoleLogger!: VSConsoleLogger;
	protected activeFile?: string;

	constructor(commandName: keyof CommandsInfoMapType) {
		this.cliCommandName = commandsInfoMap[commandName].cliCommandName;
		this.vscodeCommandName = commandsInfoMap[commandName].vscodeCommandName;
		this.commandMetadata = CommandsMetadataSingleton.getInstance().getCommandMetadataByName(this.cliCommandName);
		this.messageService = new MessageService(this.vscodeCommandName);
		this.translationService = new VSTranslationService();
	}

	protected abstract execute(): Promise<void | ActionResult<any>>;

	public async run(treeViewUri?: Uri) {
		try {
			this.init(treeViewUri);
			const validationResult = this.validateBeforeExecute();

			if (!validationResult.valid) {
				this.messageService.showErrorMessage(validationResult.message);
				return;
			}

			if (this.commandMetadata.isSetupRequired && !this.projectHasDefaultAuthId()) {
				showSetupAccountWarningMessage();
				return;
			}

			return this.execute();
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.messageService.showErrorMessage(error.message);
				return;
			}
			if (error instanceof Object && typeof error.toString === 'function') {
				this.messageService.showErrorMessage(error.toString());
				return;
			}
			this.messageService.showErrorMessage(this.translationService.getMessage(COMMAND.ERROR, this.vscodeCommandName));
			return;
		}
	}

	private init(treeViewUri?: Uri) {
		this.rootWorkspaceFolder = this.getRootProjectFolder(treeViewUri);
		this.vsConsoleLogger = new VSConsoleLogger(true, this.rootWorkspaceFolder);
		this.messageService.executionPath = this.rootWorkspaceFolder;
		this.isSelectedFromContextMenu = treeViewUri ? true : false;
		this.activeFile = treeViewUri ? treeViewUri.fsPath : window.activeTextEditor?.document.uri.fsPath;
	}

	protected validateBeforeExecute(): ValidationResult {
		if (!this.activeFile) {
			return this.unsuccessfulValidation(this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE));
		}
		if (!this.rootWorkspaceFolder) {
			return this.unsuccessfulValidation(this.translationService.getMessage(ERRORS.NO_ACTIVE_WORKSPACE));
		}
		const validProjectResult = this.validateIsValidSuiteCloudProject();
		if (!validProjectResult.valid) {
			return validProjectResult;
		}

		return this.successfulValidation();
	}

	protected successfulValidation(): { valid: true } {
		return { valid: true };
	}
	protected unsuccessfulValidation(message: string): { valid: false; message: string } {
		return {
			valid: false,
			message,
		};
	}

	protected validateIsValidSuiteCloudProject(): ValidationResult {
		const projectFolder: string = this.getProjectFolderPath();

		const manifestFileLocation: string = path.join(projectFolder, ApplicationConstants.FILES.MANIFEST_XML);
		const manifestFileExists: boolean = fs.existsSync(manifestFileLocation);

		if (!manifestFileExists) {
			return this.isSelectedFromContextMenu
				? this.unsuccessfulValidation(
						this.translationService.getMessage(
							ERRORS.MISSING_MANIFEST_FILE_CONTEXT_MENU_FILE,
							projectFolder,
							ApplicationConstants.LINKS.INFO.PROJECT_STRUCTURE
						)
				  )
				: this.unsuccessfulValidation(
						this.translationService.getMessage(
							ERRORS.MISSING_MANIFEST_FILE_COMMAND_PALETTE,
							projectFolder,
							ApplicationConstants.LINKS.INFO.PROJECT_STRUCTURE
						)
				  );
		}

		return this.successfulValidation();
	}

	// uri is present when action originated from a contextMenu of the treeView
	private getRootProjectFolder(uri?: vscode.Uri): string | undefined {
		if (uri) {
			const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
			return activeWorkspaceFolder?.uri.fsPath;
		}

		const activeTextEditor = vscode.window.activeTextEditor;
		const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : undefined;
		return activeWorkspaceFolder?.uri.fsPath;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string | string[] } = {}, otherExecutionPath?: string) {
		const suiteCloudRunnerRunResult = await new SuiteCloudRunner(
			this.vsConsoleLogger,
			otherExecutionPath !== undefined ? otherExecutionPath : this.rootWorkspaceFolder
		).run({
			commandName: this.cliCommandName,
			arguments: args,
		});

		this.vsConsoleLogger.info('');

		return suiteCloudRunnerRunResult;
	}

	/**
	 * To get the projectFolderPath, the action must have been triggered within a project context.
	 *
	 * @returns {string} the projectFolderPath or undefined if the action was not triggered within a project context
	 */
	protected getProjectFolderPath(): string {
		const cliConfigurationService = new CLIConfigurationService();
		cliConfigurationService.initialize(this.rootWorkspaceFolder);

		return cliConfigurationService.getProjectFolder(this.cliCommandName);
	}

	private projectHasDefaultAuthId(): boolean {
		let defaultAuthId: string;
		try {
			defaultAuthId = AuthenticationUtils.getProjectDefaultAuthId(this.rootWorkspaceFolder);
		} catch (error) {
			return false;
		}

		return defaultAuthId !== undefined && defaultAuthId !== '';
	}
}
