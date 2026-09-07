/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { commandsInfoMap } from '../../commandsMap';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('commandsMap.ts matches the command IDs and titles in package.json', () => {
		const packageJson = require('../../../package.json');
		const manifestCommands = new Map<string, string>(
			packageJson.contributes.commands.map((command: any) => [command.command, command.title])
		);
		const runtimeCommands = new Map<string, string>(
			Object.values(commandsInfoMap).map((command) => [
				command.vscodeCommandId,
				command.vscodeCommandName,
			])
		);

		assert.deepStrictEqual(runtimeCommands, manifestCommands);
	});
});
