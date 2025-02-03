/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri, window } from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { CommandsInfoMapType, commandsInfoMap } from '../commandsMap';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import MessageService from '../service/MessageService';
import { COMMAND, ERRORS, REFRESH_AUTHORIZATION } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { showSetupAccountWarningMessage } from '../startup/ShowSetupAccountWarning';
import { ActionResult, ValidationResult } from '../types/ActionResult';
import { CommandMetadata } from '../types/Metadata';
import { ApplicationConstants, AuthenticationUtils, CLIConfigurationService, ExecutionEnvironmentContext } from '../util/ExtensionUtil';

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

			if (this.commandMetadata.isSetupRequired) {
				const defaultAuthId = this.getDefaultAuthId();
				if (!defaultAuthId) {
					showSetupAccountWarningMessage();
					return;
				}
				await this.checkAndRefreshAuthorizationIfNeeded(defaultAuthId);
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

			if (typeof error === 'string') {
				this.vsConsoleLogger.error(error);
				this.messageService.showCommandError(this.translationService.getMessage(COMMAND.ERROR, this.vscodeCommandName));
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

	private getDefaultAuthId(): string {
		try {
			return AuthenticationUtils.getProjectDefaultAuthId(this.rootWorkspaceFolder);
		} catch (error) {
			return '';
		}
	}

	private async checkAndRefreshAuthorizationIfNeeded(defaultAuthId: string): Promise<void> {
		const executionEnvironmentContext = new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});
		const inspectAuthzOperationResult = await AuthenticationUtils.checkIfReauthorizationIsNeeded(
			defaultAuthId,
			getSdkPath(),
			executionEnvironmentContext
		);
		if (!inspectAuthzOperationResult.isSuccess()) {
			throw inspectAuthzOperationResult.errorMessages;
		}
		const inspectAuthzData = inspectAuthzOperationResult.data;
		if (inspectAuthzData[ApplicationConstants.AUTHORIZATION_PROPERTIES_KEYS.NEEDS_REAUTHORIZATION]) {
			this.messageService.showInformationMessage(
				this.translationService.getMessage(
					REFRESH_AUTHORIZATION.CREDENTIALS_NEED_TO_BE_REFRESHED, defaultAuthId
				)
			);
			const refreshAuthzOperationResult = await AuthenticationUtils.refreshAuthorization(
				defaultAuthId,
				getSdkPath(),
				executionEnvironmentContext
			);
			if (!refreshAuthzOperationResult.isSuccess()) {
				throw refreshAuthzOperationResult.errorMessages;
			}
			this.messageService.showInformationMessage(
				this.translationService.getMessage(
					REFRESH_AUTHORIZATION.AUTHORIZATION_REFRESH_COMPLETED
				)
			);
		}
	}
}
