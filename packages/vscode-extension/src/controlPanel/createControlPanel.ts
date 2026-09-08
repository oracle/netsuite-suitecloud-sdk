/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVELOPER_ASSISTANT } from '../ApplicationConstants';
import ControlPanelController from './ControlPanelController';
import {
	createInitialPanelState,
	getDefaultPanelSettings,
} from './developerAssistant/Configuration';
import PreferencesStore from './developerAssistant/PreferencesStore';
import SdkApiKeyStorage from './developerAssistant/apiKey/SdkApiKeyStorage';
import ClineChatOpener from './developerAssistant/cline/ChatOpener';
import ClineCompatibilityService from './developerAssistant/cline/ClineCompatibilityService';
import ClineConfigService from './developerAssistant/cline/ClineConfigService';
import ExtensionHostRestartService from './developerAssistant/cline/ExtensionHostRestartService';
import ClineFileStore from './developerAssistant/cline/FileStore';
import ClineIntegrationAdapter from './developerAssistant/cline/IntegrationAdapter';
import FeedbackService from './developerAssistant/feedback/FeedbackService';
import SdkService from './developerAssistant/sdk/SdkService';

export const createControlPanel = (
	extensionContext: vscode.ExtensionContext,
	statusBarItem: vscode.StatusBarItem,
	sdkDependenciesReady: Promise<void>
): ControlPanelController => {
	const defaults = getDefaultPanelSettings();
	const preferencesStore = new PreferencesStore(
		extensionContext.workspaceState,
		DEVELOPER_ASSISTANT.PREFERENCES_STORAGE_KEY,
		vscode.workspace.getConfiguration(DEVELOPER_ASSISTANT.CONFIGURATION_SECTION)
	);
	const persistedPreferences = preferencesStore.load(defaults);

	const clineFileStore = new ClineFileStore();
	const clineAdapter = new ClineIntegrationAdapter(clineFileStore);

	return new ControlPanelController({
		extensionContext,
		statusBarItem,
		sdkDependenciesReady,
		sdkService: new SdkService(),
		clineFileStore,
		clineChatOpener: new ClineChatOpener(vscode.commands),
		clineCompatibilityService: new ClineCompatibilityService(clineAdapter),
		clineConfigService: new ClineConfigService(clineAdapter, extensionContext.globalState),
		extensionHostRestartService: new ExtensionHostRestartService(
			(commandId) => vscode.commands.executeCommand(commandId)
		),
		feedbackService: new FeedbackService(),
		preferencesStore,
		apiKeyStorage: new SdkApiKeyStorage(),
		initialState: createInitialPanelState(defaults, persistedPreferences),
	});
};
