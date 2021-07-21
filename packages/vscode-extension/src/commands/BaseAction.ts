/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { assert } from 'console';
import { window } from 'vscode';
import { commandsInfoMap } from '../commandsMap';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import MessageService from '../service/MessageService';
import { ERRORS } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { CLIConfigurationService, getRootProjectFolder } from '../util/ExtensionUtil';

export default abstract class BaseAction {
	protected readonly translationService: VSTranslationService;
	protected isFileSelected?: boolean;
	protected readonly messageService: MessageService;
	protected readonly vscodeCommandName: string;
	protected readonly cliCommandName: string;
	protected executionPath?: string;
	protected vsConsoleLogger!: VSConsoleLogger;
	protected activeFile?: string;

	protected abstract execute(): Promise<void>;

	constructor(commandName: string) {
		assert(commandsInfoMap.hasOwnProperty(commandName), `Command name ${commandName} is not present in commandsMap`);
		this.cliCommandName = commandsInfoMap[commandName].cliCommandName;
		this.vscodeCommandName = commandsInfoMap[commandName].vscodeCommandName;
		this.messageService = new MessageService(this.vscodeCommandName);
		this.translationService = new VSTranslationService();
	}

	protected init(fsPath?: string) {
		this.executionPath = getRootProjectFolder();
		this.vsConsoleLogger = new VSConsoleLogger(true, this.executionPath);
		this.messageService.executionPath = this.executionPath;
		this.isFileSelected = fsPath ? true : false;
		this.activeFile = fsPath ? fsPath : window.activeTextEditor?.document.uri.fsPath;
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		if (!this.executionPath) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE),
			};
		} else {
			return {
				valid: true,
			};
		}
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string | string[] } = {}, executionPath?: string) {
		let executionPathToUse = this.executionPath;
		if (executionPath !== undefined) {
			executionPathToUse = executionPath;
		}

		const suiteCloudRunnerRunResult = await new SuiteCloudRunner(this.vsConsoleLogger, executionPathToUse).run({
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
		cliConfigurationService.initialize(this.executionPath);

		return cliConfigurationService.getProjectFolder(this.cliCommandName);
	}

	public async run(fsPath?: string) {
		this.init(fsPath);
		const validationStatus = this.validate();
		if (validationStatus.valid) {
			return this.execute();
		} else {
			this.messageService.showErrorMessage(validationStatus.message);
			return;
		}
	}
}
