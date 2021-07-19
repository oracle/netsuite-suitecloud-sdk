/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import MessageService from './MessageService';

const IMPORT_OBJECT_COMMAND_NAME = 'object:import';
const LIST_OBJECT_COMMAND_NAME = "object:list";
const CONSOLE_LOGGER_ERROR = 'vsConsole Logger not initialized';

export default class ImportObjectService {
	private executionPath?: string;
	private readonly messageService: MessageService;
	private vsConsoleLogger: VSConsoleLogger | undefined;

	constructor(messageService: MessageService) {
		this.messageService = messageService;
	}

	async importObjects(
		destinationFolder: string,
		types: string[],
		scriptId: string | undefined,
		includeReferencedFiles: boolean,
		statusBarMessage: string,
		executionPath: string | undefined
	) {
		this.executionPath = executionPath;
		let commandArgs: any = { type: types, destinationfolder: destinationFolder, scriptid: scriptId };

		if (!includeReferencedFiles) {
			commandArgs.excludefiles = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, IMPORT_OBJECT_COMMAND_NAME);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	async listObjects(
		destinationFolder: string,
		types: string[],
		scriptId: string | undefined,
		includeReferencedFiles: boolean,
		statusBarMessage: any,
		executionPath: string | undefined
	) {
		this.executionPath = executionPath;
		let commandArgs: any = { type: types, destinationfolder: destinationFolder, scriptid: scriptId };

		if (!includeReferencedFiles) {
			commandArgs.excludefiles = true;
		}

		
		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, LIST_OBJECT_COMMAND_NAME);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}, command: string) {
		if (!this.vsConsoleLogger) {
			throw Error(CONSOLE_LOGGER_ERROR);
		}
		return new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
			commandName: command,
			arguments: args,
		});
	}

	setVsConsoleLogger(vsConsoleLogger: VSConsoleLogger) {
		this.vsConsoleLogger = vsConsoleLogger;
	}
}
