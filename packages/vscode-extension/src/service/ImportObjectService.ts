/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from './MessageService';
import { IMPORT_OBJECTS, LIST_OBJECTS } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import VSConsoleLogger from '../loggers/VSConsoleLogger';

const IMPORT_OBJECT_COMMAND_NAME = 'object:import';
const LIST_OBJECT_COMMAND_NAME = 'object:list';

export default class CustomObjectService {
	private executionPath?: string;
	private readonly messageService: MessageService;
	private translationService: VSTranslationService;

	constructor(messageService: MessageService, translationService: VSTranslationService) {
		this.messageService = messageService;
		this.translationService = translationService;
	}

	async importObjects(
		destinationFolder: string,
		appId: string,
		scriptIds: string[],
		includeReferencedFiles: boolean,
		executionPath: string,
		consoleLogger: VSConsoleLogger
	) {
		this.executionPath = executionPath;
		//We choose 'ALL' types because it is chosen before which scriptIds should be imported and not by type
		let commandArgs: any = { type: 'ALL', destinationfolder: destinationFolder };

		commandArgs.scriptid = scriptIds && scriptIds.length > 0 ? scriptIds : 'ALL';

		if (appId !== '') {
			commandArgs.appid = appId;
		}

		if (!includeReferencedFiles) {
			commandArgs.excludefiles = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, IMPORT_OBJECT_COMMAND_NAME, consoleLogger);
		const statusBarMessage = this.translationService.getMessage(IMPORT_OBJECTS.IMPORTING_OBJECTS);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return commandActionPromise;
	}

	async listObjects(appId: string, types: string[], scriptId: string, executionPath: string, consoleLogger: VSConsoleLogger) {
		this.executionPath = executionPath;
		let commandArgs: any = { type: types.join(' ') };

		if (appId !== '') {
			commandArgs.appid = appId;
		}
		if (scriptId) {
			commandArgs.scriptid = scriptId;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, LIST_OBJECT_COMMAND_NAME, consoleLogger);
		const statusBarMessage = this.translationService.getMessage(LIST_OBJECTS.LISTING);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}, command: string, consoleLogger: VSConsoleLogger) {
		return new SuiteCloudRunner(consoleLogger, this.executionPath).run({
			commandName: command,
			arguments: args,
		});
	}
}
