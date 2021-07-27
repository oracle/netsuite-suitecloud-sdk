/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import MessageService from './MessageService';

const SUITECLOUD_COMMAND_NAME = 'file:import';

export default class ImportFileService {
	private executionPath?: string;
	private readonly messageService: MessageService;

	constructor(messageService: MessageService) {
		this.messageService = messageService;
	}

	async importFiles(
		selectedFilesPaths: string[],
		directory: string,
		statusBarMessage: string,
		executionPath: string | undefined,
		excludeProperties: boolean,
		consoleLogger: VSConsoleLogger
	) {
		this.executionPath = executionPath;
		let commandArgs: any = { project: directory, paths: selectedFilesPaths };

		if (excludeProperties) {
			commandArgs.excludeproperties = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, consoleLogger);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}, consoleLogger: VSConsoleLogger) {
		return new SuiteCloudRunner(consoleLogger, this.executionPath).run({
			commandName: SUITECLOUD_COMMAND_NAME,
			arguments: args,
		});
	}
}
