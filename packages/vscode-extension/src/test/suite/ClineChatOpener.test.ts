/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import ClineChatOpener, { CommandExecutor } from '../../service/controlPanel/devAssist/cline/ChatOpener';

suite('Cline Chat Opener', () => {
	test('opens the first available chat focus command', async () => {
		const executed: Array<{ command: string; args: unknown[] }> = [];
		const commands: CommandExecutor = {
			getCommands: async () => ['cline.focusChatInput'],
			executeCommand: async (command, ...args) => {
				executed.push({ command, args });
				return undefined;
			},
		};

		const opened = await new ClineChatOpener(commands).open();

		assert.strictEqual(opened, true);
		assert.deepStrictEqual(
			executed.map(({ command }) => command),
			['workbench.view.extension.claude-dev-ActivityBar', 'cline.focusChatInput']
		);
	});

	test('falls through failed activity and focus commands', async () => {
		const executed: string[] = [];
		const commands: CommandExecutor = {
			getCommands: async () => ['cline.focusChatInput', 'cline.SidebarProvider.focus'],
			executeCommand: async (command) => {
				executed.push(command);
				if (
					command === 'workbench.view.extension.claude-dev-ActivityBar' ||
					command === 'cline.focusChatInput'
				) {
					throw new Error('not available');
				}
				return undefined;
			},
		};

		const opened = await new ClineChatOpener(commands).open();

		assert.strictEqual(opened, true);
		assert.deepStrictEqual(executed, [
			'workbench.view.extension.claude-dev-ActivityBar',
			'workbench.view.extension.cline-ActivityBar',
			'cline.focusChatInput',
			'cline.SidebarProvider.focus',
		]);
	});

	test('opens the marketplace fallback when chat cannot be focused', async () => {
		const executed: Array<{ command: string; args: unknown[] }> = [];
		const commands: CommandExecutor = {
			getCommands: async () => [],
			executeCommand: async (command, ...args) => {
				executed.push({ command, args });
				if (command.startsWith('workbench.view.extension.')) {
					throw new Error('not available');
				}
				return undefined;
			},
		};

		const opened = await new ClineChatOpener(commands).open();

		assert.strictEqual(opened, false);
		assert.deepStrictEqual(executed[2], {
			command: 'workbench.extensions.search',
			args: ['@id:saoudrizwan.claude-dev'],
		});
	});
});
