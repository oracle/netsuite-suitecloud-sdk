/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const RESTART_EXTENSION_HOST_COMMAND_ID = 'workbench.action.restartExtensionHost';

type ExecuteCommand = (commandId: string) => PromiseLike<unknown>;

/** Isolates the internal VS Code command until a supported per-extension restart API is available. */
export default class ExtensionHostRestartService {
	constructor(private readonly _executeCommand: ExecuteCommand) {}

	async restart(): Promise<void> {
		await this._executeCommand(RESTART_EXTENSION_HOST_COMMAND_ID);
	}
}
