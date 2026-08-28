/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import {
	SuiteCloudPanelState,
	SuiteCloudPanelUpdateFormPayload,
} from './SuiteCloudPanelTypes';

export const applyFormChangesToState = (
	state: SuiteCloudPanelState,
	formData: SuiteCloudPanelUpdateFormPayload
): SuiteCloudPanelState => {
	const updatedState: SuiteCloudPanelState = { ...state };
	const canChangeProxyConfig = state.proxyStatus === 'stopped' || state.proxyStatus === 'error';

	if (canChangeProxyConfig && typeof formData.authId === 'string') {
		updatedState.authId = formData.authId;
	}

	if (canChangeProxyConfig && typeof formData.port === 'number' && Number.isFinite(formData.port)) {
		updatedState.port = Math.trunc(formData.port);
	}

	if (formData.clineScope === 'workspace' || formData.clineScope === 'user') {
		updatedState.clineScope = formData.clineScope;
	}

	if (typeof formData.disableWelcomeNotification === 'boolean') {
		updatedState.disableWelcomeNotification = formData.disableWelcomeNotification;
	}

	const proxyConfigChanged = updatedState.authId !== state.authId || updatedState.port !== state.port;
	if (state.proxyStatus === 'error' && proxyConfigChanged) {
		updatedState.proxyStatus = 'stopped';
		updatedState.lastError = null;
	}

	updatedState.hasPendingRuntimeConfig = calculatePendingRuntimeConfig(updatedState);
	return updatedState;
};

export const calculatePendingRuntimeConfig = (state: SuiteCloudPanelState): boolean => {
	if (state.proxyStatus !== 'running') {
		return false;
	}
	if (state.proxyOwnership !== 'owned') {
		return false;
	}
	return state.runtimeAuthId !== state.authId || state.runtimePort !== state.port;
};

export const markRuntimeConfigAsActive = (state: SuiteCloudPanelState): SuiteCloudPanelState => {
	return {
		...state,
		runtimeAuthId: state.authId,
		runtimePort: state.port,
		proxyOwnership: 'owned',
		autoStartProxyOnStartup: true,
		hasPendingRuntimeConfig: false,
	};
};

export const clearRuntimeConfig = (
	state: SuiteCloudPanelState,
	options: { clearStartIntent?: boolean } = {}
): SuiteCloudPanelState => {
	return {
		...state,
		runtimeAuthId: null,
		runtimePort: null,
		proxyOwnership: 'none',
		autoStartProxyOnStartup: options.clearStartIntent ? false : state.autoStartProxyOnStartup,
		hasPendingRuntimeConfig: false,
	};
};
