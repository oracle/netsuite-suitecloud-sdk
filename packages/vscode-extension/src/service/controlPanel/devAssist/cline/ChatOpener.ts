/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { CLINE_EXTENSION_ID } from './Constants';

const ACTIVITY_BAR_COMMANDS = [
	'workbench.view.extension.claude-dev-ActivityBar',
	'workbench.view.extension.cline-ActivityBar',
];
const CHAT_FOCUS_COMMANDS = [
	'cline.focusChatInput',
	'claude-dev.SidebarProvider.focus',
	'cline.SidebarProvider.focus',
];

export type CommandExecutor = {
	getCommands(filterInternal: boolean): PromiseLike<string[]>;
	executeCommand(command: string, ...rest: unknown[]): PromiseLike<unknown>;
};

export default class ClineChatOpener {
	private readonly _commands: CommandExecutor;

	constructor(commands: CommandExecutor) {
		this._commands = commands;
	}

	async open(): Promise<boolean> {
		const availableCommands = await this._commands.getCommands(true);

		await this._openActivityBar();
		for (const commandId of CHAT_FOCUS_COMMANDS) {
			if (
				availableCommands.includes(commandId) &&
				await this._executeBestEffort(commandId)
			) {
				return true;
			}
		}

		await this._executeBestEffort(
			'workbench.extensions.search',
			`@id:${CLINE_EXTENSION_ID}`
		);
		return false;
	}

	private async _openActivityBar(): Promise<void> {
		for (const commandId of ACTIVITY_BAR_COMMANDS) {
			if (await this._executeBestEffort(commandId)) {
				return;
			}
		}
	}

	private async _executeBestEffort(commandId: string, ...args: unknown[]): Promise<boolean> {
		try {
			await this._commands.executeCommand(commandId, ...args);
			return true;
		} catch {
			return false;
		}
	}
}
