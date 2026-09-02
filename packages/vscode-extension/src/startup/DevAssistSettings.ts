/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVASSIST } from '../ApplicationConstants';
import PreferencesStore from '../service/controlPanel/devAssist/PreferencesStore';

const PANEL_STATE_STORAGE_KEY = 'suitecloud.controlPanel.state.v1';

export type DevAssistCurrentSettings = {
	authID: string;
	localPort: number;
	startupNotificationDisabled: boolean;
};

export const getDevAssistCurrentSettings = (workspaceState: vscode.Memento): DevAssistCurrentSettings => {
	const panelPreferencesStore = new PreferencesStore(
		workspaceState,
		PANEL_STATE_STORAGE_KEY
	);
	const panelPreferences = panelPreferencesStore.load({
		authId: DEVASSIST.DEFAULT_VALUES.authID,
		localPort: DEVASSIST.DEFAULT_VALUES.localPort,
	});

	return {
		authID: panelPreferences.authId,
		localPort: panelPreferences.port,
		startupNotificationDisabled: panelPreferences.disableWelcomeNotification,
	};
};
