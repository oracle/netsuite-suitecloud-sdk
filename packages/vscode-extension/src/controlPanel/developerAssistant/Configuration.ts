/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVELOPER_ASSISTANT } from '../../ApplicationConstants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from './Strings';
import { ClineScope, SuiteCloudPanelState } from './State';

export const VALID_PROXY_PORT_MIN = DEVELOPER_ASSISTANT.PORT_RANGE.MIN;
export const VALID_PROXY_PORT_MAX = DEVELOPER_ASSISTANT.PORT_RANGE.MAX;

export type DefaultPanelSettings = {
	authId: string;
	localPort: number;
};

export const getDefaultPanelSettings = (): DefaultPanelSettings => ({
	authId: DEVELOPER_ASSISTANT.DEFAULT_VALUES.authID,
	localPort: DEVELOPER_ASSISTANT.DEFAULT_VALUES.localPort,
});

export type InitialPanelPreferences = {
	authId: string;
	port: number;
	clineScope: ClineScope;
	autoStartProxyOnStartup: boolean;
	disableWelcomeNotification: boolean;
};

export const buildProxyBaseUrl = (port: number): string =>
	`${DEVELOPER_ASSISTANT.PROXY_URL.SCHEME}${DEVELOPER_ASSISTANT.PROXY_URL.LOCALHOST_IP}:${port}${DEVELOPER_ASSISTANT.PROXY_URL.BASE_PATH}`;

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
		initializationStatus: 'loading',
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
		baseUrl: buildProxyBaseUrl(port),
		lastError: null,
		proxyOwnership: 'none',
		autoStartProxyOnStartup: preferences.autoStartProxyOnStartup,
		disableWelcomeNotification: preferences.disableWelcomeNotification,
		clineScope: preferences.clineScope,
		authIds: [],
		isClineInstalled: false,
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
