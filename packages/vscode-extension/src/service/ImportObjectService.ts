/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import MessageService from './MessageService';
import { IMPORT_OBJECTS, LIST_OBJECTS } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import DummyConsoleLogger from '../loggers/DummyConsoleLogger';
import { ConsoleLogger } from '../util/ExtensionUtil';

const IMPORT_OBJECT_COMMAND_NAME = 'object:import';
const LIST_OBJECT_COMMAND_NAME = 'object:list';
const CONSOLE_LOGGER_ERROR = 'vsConsole Logger not initialized';

export default class CustomObjectService {
	private executionPath?: string;
	private readonly messageService: MessageService;
	private vsConsoleLogger: VSConsoleLogger | undefined;
	private translationService: VSTranslationService;

	constructor(messageService: MessageService, translationService: VSTranslationService) {
		this.messageService = messageService;
		this.translationService = translationService;
	}

	async importObjects(
		destinationFolder: string,
		appId: string | undefined,
		scriptIds: string[] | undefined,
		includeReferencedFiles: boolean,
		executionPath: string | undefined
	) {
		this.executionPath = executionPath;
		//We choose 'ALL' types because it is chosen before which scriptIds should be imported and not by type
		let commandArgs: any = { type: 'ALL', destinationfolder: destinationFolder };

		commandArgs.scriptid = scriptIds && scriptIds.length > 0 ? scriptIds : 'ALL';

		if (appId == undefined || appId.length != 0) {
			commandArgs.appid = appId;
		}

		if (!includeReferencedFiles) {
			commandArgs.excludefiles = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, IMPORT_OBJECT_COMMAND_NAME);
		const statusBarMessage = this.translationService.getMessage(IMPORT_OBJECTS.IMPORTING_OBJECTS);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	async listObjects(appId: string | undefined, types: string[], scriptId: string | undefined, executionPath: string | undefined) {
		this.executionPath = executionPath;
		let commandArgs: any = { type: types.join(' ') };

		if (appId) {
			commandArgs.appid = appId;
		}
		if (scriptId) {
			commandArgs.scriptid = scriptId;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, LIST_OBJECT_COMMAND_NAME, new DummyConsoleLogger());
		const statusBarMessage = this.translationService.getMessage(LIST_OBJECTS.LISTING);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}, command: string, consoleLogger?: typeof ConsoleLogger) {
		const logger = consoleLogger ? consoleLogger : this.vsConsoleLogger;
		if (!logger) {
			throw Error(CONSOLE_LOGGER_ERROR);
		}
		return new SuiteCloudRunner(logger, this.executionPath).run({
			commandName: command,
			arguments: args,
		});
	}

	setVsConsoleLogger(vsConsoleLogger: typeof ConsoleLogger) {
		this.vsConsoleLogger = vsConsoleLogger;
	}
}
