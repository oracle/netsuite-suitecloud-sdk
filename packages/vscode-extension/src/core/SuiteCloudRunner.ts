/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { getSdkPath } from './sdksetup/SdkProperties';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { ApplicationConstants,
	CLIConfigurationService,
	CommandActionExecutor,
	CommandOptionsValidator,
	ExecutionEnvironmentContext
} from '../util/ExtensionUtil';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import { ActionResult } from '../types/ActionResult';

export default class SuiteCloudRunner {
	private commandActionExecutor: any;

	constructor(vsConsoleLogger: VSConsoleLogger, executionPath?: string) {
		process.argv.push(`${ApplicationConstants.PROJECT_FOLDER_ARG}=${executionPath}`);
		this.commandActionExecutor = new CommandActionExecutor({
			//THIS SHOULD BE A FACTORY METHOD INSIDE THE CLI CommandActionExecutorFactory.get({executionPath:executionPath})
			executionPath: executionPath,
			commandOptionsValidator: new CommandOptionsValidator(),
			cliConfigurationService: new CLIConfigurationService(),
			commandsMetadataService: CommandsMetadataSingleton.getInstance(),
			log: vsConsoleLogger,
			sdkPath: getSdkPath(),
			executionEnvironmentContext: new ExecutionEnvironmentContext({
				platform: VSCODE_PLATFORM,
				platformVersion: vscode.version,
			}),
		});
	}

	run(options: any) : Promise<ActionResult<any>>{
		options.runInInteractiveMode = false;
		return this.commandActionExecutor.executeAction(options);
	}
}
