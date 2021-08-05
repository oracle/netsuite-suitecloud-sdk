/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { output } from '../suitecloud';
import { ConsoleLogger } from '../util/ExtensionUtil';
import { getTimestamp } from '../util/DateUtils';
import * as vscode from 'vscode';
export default class VSConsoleLogger extends ConsoleLogger {
	private _executionPath?: string;
	private _addExecutionDetailsToLog: boolean = false;

	constructor(addExecutionDetailsToLog: boolean = false, executionPath?: string) {
		super();

		this._addExecutionDetailsToLog = addExecutionDetailsToLog;
		this._executionPath = executionPath;
	}

	private getExecutionDetails(): string {
		if (this._executionPath) {
			const executionPathParts = this._executionPath.replace(/\\/g, '/').split('/');
			const projectFolderName = executionPathParts[executionPathParts.length - 1];
			return getTimestamp() + ' - ' + projectFolderName;
		} else {
			return getTimestamp();
		}
	}

	// Output from VSCode doesn't accept colors, for the moment we would pring in default white
	// We could explore some workarounds in future like creating a Terminal, importing a new library or just implment it ourselves
	println(message: string): void {
		if (this._addExecutionDetailsToLog) {
			output.appendLine(this.getExecutionDetails());
			this._addExecutionDetailsToLog = false;
		}
		this.checkForCorruptedJar(message);
		output.appendLine(message);
	}

	info(message: string): void {
		this.println(message);
	}

	result(message: string): void {
		this.println(message);
	}

	warning(message: string): void {
		this.println(message);
	}

	error(message: string): void {
		this.println(message);
	}

	private checkForCorruptedJar(message: string) {
		const invalidJarFileMessage = 'Invalid or corrupt jarfile';
		if (message.includes(invalidJarFileMessage)) {
			const restartAction = 'Restart Now';

			vscode.window.showErrorMessage(
				'There was a problem with SuiteCloud Extension dependencies. Restart your Visual Studio Code instance.',
				restartAction
			).then(result => {
				if(result === restartAction) {
					vscode.commands.executeCommand('workbench.action.reloadWindow');
				}
			});
		}

	}
}
