/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import type * as vscode from 'vscode';
import { ClineScope } from '../../../controlPanel/devAssist/State';

export type LegacyPanelSettings = Pick<vscode.WorkspaceConfiguration, 'get'>;

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
	private readonly _legacySettings?: LegacyPanelSettings;

	constructor(
		workspaceState: vscode.Memento,
		storageKey: string,
		legacySettings?: LegacyPanelSettings
	) {
		this._workspaceState = workspaceState;
		this._storageKey = storageKey;
		this._legacySettings = legacySettings;
	}

	load(defaultSettings: { authId: string; localPort: number }): PersistedPanelPreferences {
		const storedPreferences =
			this._workspaceState.get<Partial<PersistedPanelPreferences>>(this._storageKey);
		const legacySettings = storedPreferences ? undefined : this._legacySettings;

		return {
			authId:
				typeof storedPreferences?.authId === 'string'
					? storedPreferences.authId
					: legacySettings?.get('authID', defaultSettings.authId) ?? defaultSettings.authId,
			port:
				typeof storedPreferences?.port === 'number'
					? storedPreferences.port
					: legacySettings?.get('localPort', defaultSettings.localPort) ??
					  defaultSettings.localPort,
			// The compact panel exposes one automatic Cline integration path.
			// Migrate legacy workspace/manual preferences back to global Cline config.
			clineScope: 'user',
			autoStartProxyOnStartup:
				storedPreferences?.autoStartProxyOnStartup === true ||
				legacySettings?.get<boolean>('enable', false) === true,
			disableWelcomeNotification:
				storedPreferences?.disableWelcomeNotification === true ||
				legacySettings?.get<boolean>('disableWelcomeNotification', false) === true,
		};
	}

	save(preferences: PersistedPanelPreferences): PromiseLike<void> {
		return this._workspaceState.update(this._storageKey, preferences);
	}
}
