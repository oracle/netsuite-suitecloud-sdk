/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import ControlPanelController from './ControlPanelController';
import { createControlPanel } from './createControlPanel';

let controlPanelController: ControlPanelController | undefined;

export const initializeSuiteCloudControlPanel = (
	extensionContext: vscode.ExtensionContext,
	statusBarItem: vscode.StatusBarItem,
	sdkDependenciesReady: Promise<void>
): ControlPanelController => {
	if (!controlPanelController) {
		controlPanelController = createControlPanel(
			extensionContext,
			statusBarItem,
			sdkDependenciesReady
		);
		controlPanelController.registerSidebarViewProvider();
	}
	return controlPanelController;
};

export const openSuiteCloudControlPanel = async (): Promise<void> => {
	await controlPanelController?.open();
};

export const disposeSuiteCloudControlPanel = async (): Promise<void> => {
	await controlPanelController?.dispose();
	controlPanelController = undefined;
};

export const startSuiteCloudControlPanelProxyIfEnabled = async (): Promise<void> => {
	await controlPanelController?.startProxyOnStartupIfEnabled();
};

export const showSuiteCloudControlPanelWelcomeIfNeeded = async (): Promise<void> => {
	await controlPanelController?.showWelcomeIfNeeded();
};

export const applyPendingSuiteCloudClineConfig = async (): Promise<void> => {
	await controlPanelController?.applyPendingClineConfig();
};
