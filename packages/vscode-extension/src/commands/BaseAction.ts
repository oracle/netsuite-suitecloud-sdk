/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { VSTranslationService } from '../service/VSTranslationService';
import { CLIConfigurationService, getRootProjectFolder } from '../util/ExtensionUtil';
import { ERRORS } from '../service/TranslationKeys';
import { commandsInfoMap } from '../commandsMap';
import { assert } from 'console';

export default abstract class BaseAction {
	protected readonly translationService: VSTranslationService;
	protected readonly messageService: MessageService;
	protected readonly vscodeCommandName: string;
	protected readonly cliCommandName: string;
	protected executionPath?: string;
	protected vsConsoleLogger!: VSConsoleLogger;

	protected abstract execute(): Promise<void>;

	constructor(commandName: string) {
		assert(commandsInfoMap.hasOwnProperty(commandName), `Command name ${commandName} is not present in commandsMap`);
		this.cliCommandName = commandsInfoMap[commandName].cliCommandName;
		this.vscodeCommandName = commandsInfoMap[commandName].vscodeCommandName;
		this.messageService = new MessageService(this.vscodeCommandName);
		this.translationService = new VSTranslationService();
	}

	protected init() {
		this.executionPath = getRootProjectFolder();
		this.vsConsoleLogger = new VSConsoleLogger(true, this.executionPath);
		this.messageService.executionPath = this.executionPath;
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		if (!this.executionPath) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE_OR_WORKSPACE),
			};
		} else {
			return {
				valid: true,
			};
		}
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}) {
		const suiteCloudRunnerRunResult = await new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
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

	public async run() {
		this.init();
		const validationStatus = this.validate();
		if (validationStatus.valid) {
			return this.execute();
		} else {
			this.messageService.showErrorMessage(validationStatus.message);
			return;
		}
	}
}
