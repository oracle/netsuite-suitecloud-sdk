/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import type * as vscode from 'vscode';
import PreferencesStore, { PersistedPanelPreferences } from '../../controlPanel/developerAssistant/PreferencesStore';

const DEFAULTS = { authId: 'default-auth', localPort: 8181 };

const createMemento = (
	preferences?: Partial<PersistedPanelPreferences>
): vscode.Memento => ({
	get: <T>() => preferences as T,
	update: async () => undefined,
	keys: () => [],
});

suite('Control Panel Preferences Store', () => {
	test('uses defaults when panel preferences do not exist', () => {
		const store = new PreferencesStore(createMemento(), 'panel-state');

		assert.deepStrictEqual(store.load(DEFAULTS), {
			authId: 'default-auth',
			port: 8181,
			clineScope: 'user',
			autoStartProxyOnStartup: false,
			disableWelcomeNotification: false,
		});
	});

	test('loads saved panel preferences', () => {
		const savedPreferences: PersistedPanelPreferences = {
			authId: 'panel-auth',
			port: 9100,
			clineScope: 'user',
			autoStartProxyOnStartup: false,
			disableWelcomeNotification: false,
		};
		const store = new PreferencesStore(createMemento(savedPreferences), 'panel-state');

		assert.deepStrictEqual(store.load(DEFAULTS), savedPreferences);
	});
});
