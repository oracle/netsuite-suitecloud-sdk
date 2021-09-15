/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { commandsInfoMap } from '../../commandsMap';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Command Names in commandsMap.ts should match the ones defined in the package.json', () => {
		const packagejson = require('../../../package.json');
		const vscodeCommandTitles: string[] = packagejson.contributes.commands.map((packageCommnand: any) => packageCommnand.title);
		const vscodeCommandNames: string[] = Object.values(commandsInfoMap).map((el) => el.vscodeCommandName);

		vscodeCommandTitles.forEach((title) => assert(vscodeCommandNames.includes(title), `Missing '${title}' command in commandsInfoMap.`));
		vscodeCommandNames.forEach((vscodeName) => assert(vscodeCommandTitles.includes(vscodeName), `Missing '${vscodeName}' command in package.json.`));
	});
});
