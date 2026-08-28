/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { ClineScope } from '../../controlPanel/Types';

export type PersistedPanelPreferences = {
	authId: string;
	port: number;
	clineScope: ClineScope;
	autoStartProxyOnStartup: boolean;
	disableWelcomeNotification: boolean;
};

export default class PreferencesStore {
	private readonly _workspaceState: vscode.Memento;
	private readonly _storageKey: string;

	constructor(workspaceState: vscode.Memento, storageKey: string) {
		this._workspaceState = workspaceState;
		this._storageKey = storageKey;
	}

	load(defaultSettings: { authId: string; localPort: number }): PersistedPanelPreferences {
		const storedPreferences =
			this._workspaceState.get<Partial<PersistedPanelPreferences>>(this._storageKey);

		return {
			authId:
				typeof storedPreferences?.authId === 'string'
					? storedPreferences.authId
					: defaultSettings.authId,
			port:
				typeof storedPreferences?.port === 'number'
					? storedPreferences.port
					: defaultSettings.localPort,
			// The compact panel exposes one automatic Cline integration path.
			// Migrate legacy workspace/manual preferences back to global Cline config.
			clineScope: 'user',
			autoStartProxyOnStartup: storedPreferences?.autoStartProxyOnStartup === true,
			disableWelcomeNotification: storedPreferences?.disableWelcomeNotification === true,
		};
	}

	save(preferences: PersistedPanelPreferences): PromiseLike<void> {
		return this._workspaceState.update(this._storageKey, preferences);
	}
}
