/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { VSTranslationService } from '../service/VSTranslationService';
import { CLIConfigurationService, ProjectInfoService, getRootProjectFolder } from '../util/ExtensionUtil';
import { ERRORS } from '../service/TranslationKeys';
import { getTimestamp } from '../util/DateUtils';

export default abstract class BaseAction {

	protected readonly translationService: VSTranslationService;
	protected executionPath?: string;
	protected readonly messageService: MessageService;
	protected readonly commandName: string;

	protected abstract async execute(): Promise<void>;

	constructor(commandName: string) {
		this.commandName = commandName;
		this.messageService = new MessageService(this.commandName);
		this.translationService = new VSTranslationService();
	}

    private logToOutputExecutionDetails(): void {
        const vsConsoleLogger = new VSConsoleLogger()
        if (this.executionPath) {
            const cliConfigurationService = new CLIConfigurationService();
            cliConfigurationService.initialize(this.executionPath);
            cliConfigurationService.getProjectFolder(this.commandName);
    
            const projectInfoService = new ProjectInfoService(cliConfigurationService.getProjectFolder(this.commandName));
            vsConsoleLogger.info(getTimestamp() + " - " + projectInfoService.getProjectName());
        } else {
            vsConsoleLogger.info(getTimestamp());
        }
    }

	protected init() {
		this.executionPath = getRootProjectFolder();
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

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {} ) {
        this.logToOutputExecutionDetails();

		return new SuiteCloudRunner(this.executionPath).run({
			commandName: this.commandName,
			arguments: args,
		});
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
