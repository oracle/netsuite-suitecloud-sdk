/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { output } from '../suitecloud';
import { ConsoleLogger } from '../util/ExtensionUtil';
import { getTimestamp } from '../util/DateUtils';
import { BUTTONS, ERRORS } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import * as vscode from 'vscode';

const INVALID_JAR_FILE_MESSAGE = 'Invalid or corrupt jarfile';
export default class VSConsoleLogger extends ConsoleLogger {
	private executionPath?: string;
	private addExecutionDetailsToLog: boolean = false;
	private hideProjectFolderName: boolean = false;
	private readonly translationService = new VSTranslationService();

	constructor(addExecutionDetailsToLog: boolean = false, executionPath?: string) {
		super();

		this.addExecutionDetailsToLog = addExecutionDetailsToLog;
		this.executionPath = executionPath;
	}

	private getExecutionDetails(): string {
		if (this.executionPath && !this.hideProjectFolderName) {
			const executionPathParts = this.executionPath.replace(/\\/g, '/').split('/');
			const projectFolderName = executionPathParts[executionPathParts.length - 1];
			return getTimestamp() + ' - ' + projectFolderName;
		} else {
			return getTimestamp();
		}
	}

	hiddeInitialProjectFolerNameDetails() {
		this.hideProjectFolderName = true;
	}

	// Output from VSCode doesn't accept colors, for the moment we would pring in default white
	// We could explore some workarounds in future like creating a Terminal, importing a new library or just implment it ourselves
	println(message: string): void {
		if (this.addExecutionDetailsToLog && message !== '') {
			output.appendLine(this.getExecutionDetails());
			this.addExecutionDetailsToLog = false;
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

	// TODO: SdkExecutor.js should reject in a structured way that contains error codes
	// This logic could be moved to the catch block receiving that reject object
	private checkForCorruptedJar(message: string) {
		if (typeof message?.includes === 'function' && message.includes(INVALID_JAR_FILE_MESSAGE)) {
			const restartAction = this.translationService.getMessage(BUTTONS.RESTART_NOW);

			vscode.window.showErrorMessage(
				this.translationService.getMessage(ERRORS.COURRUPTED_SDK_JAR_DEPENDENCY),
				restartAction
			).then(result => {
				if(result === restartAction) {
					vscode.commands.executeCommand('workbench.action.reloadWindow');
				}
			});
		}
	}
}
