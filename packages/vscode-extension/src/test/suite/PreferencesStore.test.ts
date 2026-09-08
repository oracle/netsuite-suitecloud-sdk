/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import type * as vscode from 'vscode';
import PreferencesStore, {
	LegacyPanelSettings,
	PersistedPanelPreferences,
} from '../../controlPanel/developerAssistant/PreferencesStore';

const DEFAULTS = { authId: 'default-auth', localPort: 8181 };

const createMemento = (
	preferences?: Partial<PersistedPanelPreferences>
): vscode.Memento => ({
	get: <T>() => preferences as T,
	update: async () => undefined,
	keys: () => [],
});

const createLegacySettings = (values: Record<string, unknown>): LegacyPanelSettings => ({
	get: <T>(section: string, defaultValue?: T) =>
		(values[section] as T | undefined) ?? defaultValue,
});

suite('Control Panel Preferences Store', () => {
	test('uses legacy Developer Assistant settings when panel preferences do not exist', () => {
		const store = new PreferencesStore(
			createMemento(),
			'panel-state',
			createLegacySettings({
				authID: 'legacy-auth',
				localPort: 9000,
				enable: true,
				disableWelcomeNotification: true,
			})
		);

		assert.deepStrictEqual(store.load(DEFAULTS), {
			authId: 'legacy-auth',
			port: 9000,
			clineScope: 'user',
			autoStartProxyOnStartup: true,
			disableWelcomeNotification: true,
		});
	});

	test('prefers saved panel preferences over legacy settings', () => {
		const savedPreferences: PersistedPanelPreferences = {
			authId: 'panel-auth',
			port: 9100,
			clineScope: 'user',
			autoStartProxyOnStartup: false,
			disableWelcomeNotification: false,
		};
		const store = new PreferencesStore(
			createMemento(savedPreferences),
			'panel-state',
			createLegacySettings({
				authID: 'legacy-auth',
				localPort: 9000,
				enable: true,
				disableWelcomeNotification: true,
			})
		);

		assert.deepStrictEqual(store.load(DEFAULTS), savedPreferences);
	});
});
