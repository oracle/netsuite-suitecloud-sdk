/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from './Strings';
import { ClineScope, SuiteCloudPanelState } from './Types';

const DEVASSIST_BASE_PATH = '/api/internal/devassist';
export const VALID_PROXY_PORT_MIN = 1024;
export const VALID_PROXY_PORT_MAX = 65535;

export type DefaultPanelSettings = {
	authId: string;
	localPort: number;
};

export type InitialPanelPreferences = {
	authId: string;
	port: number;
	clineScope: ClineScope;
	autoStartProxyOnStartup: boolean;
	disableWelcomeNotification: boolean;
};

export const buildProxyBaseUrl = (port: number): string =>
	`http://127.0.0.1:${port}${DEVASSIST_BASE_PATH}`;

export const sanitizeProxyPort = (candidatePort: number, fallbackPort: number): number =>
	Number.isInteger(candidatePort) &&
	candidatePort >= VALID_PROXY_PORT_MIN &&
	candidatePort <= VALID_PROXY_PORT_MAX
		? candidatePort
		: fallbackPort;

export const createInitialPanelState = (
	defaults: DefaultPanelSettings,
	preferences: InitialPanelPreferences
): SuiteCloudPanelState => {
	const port = sanitizeProxyPort(preferences.port, defaults.localPort);
	return {
		isSdkReady: false,
		authId: preferences.authId || defaults.authId,
		port,
		runtimeAuthId: null,
		runtimePort: null,
		hasPendingRuntimeConfig: false,
		apiKeySource: 'unknown',
		maskedApiKey: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundLabel,
		apiKeyVisible: false,
		apiKeyVisibleUntilMs: null,
		apiKeyExists: false,
		apiKeyActionLabel: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.generateLabel,
		apiKeyVisibilityInfo: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundInfo,
		proxyStatus: 'stopped',
		proxyPid: null,
		baseUrl: buildProxyBaseUrl(port),
		lastError: null,
		proxyOwnership: 'none',
		autoStartProxyOnStartup: preferences.autoStartProxyOnStartup,
		disableWelcomeNotification: preferences.disableWelcomeNotification,
		clineScope: preferences.clineScope,
		authIds: [],
		isClineCompatible: false,
		clineCompatibilityMessage: null,
		isClineConfigInSync: false,
		clineConfigSyncMessage: null,
		expandedViewOpen: false,
	};
};

export const validateProxyStartInputs = (
	state: Pick<SuiteCloudPanelState, 'authId' | 'port'>,
	unconfiguredAuthId: string
): void => {
	if (!state.authId || state.authId === unconfiguredAuthId) {
		throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.invalidAuthId);
	}
	if (
		!Number.isInteger(state.port) ||
		state.port < VALID_PROXY_PORT_MIN ||
		state.port > VALID_PROXY_PORT_MAX
	) {
		throw new Error(
			SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.invalidPortRange(
				VALID_PROXY_PORT_MIN,
				VALID_PROXY_PORT_MAX
			)
		);
	}
};
