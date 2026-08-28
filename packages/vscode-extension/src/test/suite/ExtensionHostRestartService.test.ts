/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import ExtensionHostRestartService, {
	RESTART_EXTENSION_HOST_COMMAND_ID,
} from '../../panel/ExtensionHostRestartService';

suite('Extension Host Restart Service', () => {
	test('restarts the extension host through the isolated VS Code command', async () => {
		const commands: string[] = [];
		const service = new ExtensionHostRestartService(async (commandId) => {
			commands.push(commandId);
		});

		await service.restart();

		assert.deepStrictEqual(commands, [RESTART_EXTENSION_HOST_COMMAND_ID]);
	});

	test('propagates restart failures without attempting a window reload', async () => {
		const commands: string[] = [];
		const service = new ExtensionHostRestartService(async (commandId) => {
			commands.push(commandId);
			throw new Error('restart unavailable');
		});

		await assert.rejects(service.restart(), /restart unavailable/);
		assert.deepStrictEqual(commands, [RESTART_EXTENSION_HOST_COMMAND_ID]);
	});
});
