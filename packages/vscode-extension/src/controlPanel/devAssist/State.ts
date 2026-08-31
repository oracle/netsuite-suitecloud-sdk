/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export type ClineScope = 'workspace' | 'user';

export type ProxyStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export type ProxyOwnership = 'none' | 'owned';

export type ApiKeySource = 'generated' | 'sdk' | 'unknown';

export type SuiteCloudAuthItem = {
	authId: string;
	companyName: string;
	roleName: string;
};

export type SuiteCloudPanelState = {
	isSdkReady: boolean;
	authId: string;
	port: number;
	runtimeAuthId: string | null;
	runtimePort: number | null;
	hasPendingRuntimeConfig: boolean;
	apiKeySource: ApiKeySource;
	maskedApiKey: string;
	apiKeyVisible: boolean;
	apiKeyVisibleUntilMs: number | null;
	apiKeyExists: boolean;
	apiKeyActionLabel: string;
	apiKeyVisibilityInfo: string | null;
	proxyStatus: ProxyStatus;
	proxyOwnership: ProxyOwnership;
	proxyPid: number | null;
	baseUrl: string;
	lastError: string | null;
	autoStartProxyOnStartup: boolean;
	disableWelcomeNotification: boolean;
	clineScope: ClineScope;
	authIds: SuiteCloudAuthItem[];
	isClineCompatible: boolean;
	clineCompatibilityMessage: string | null;
	isClineConfigInSync: boolean;
	clineConfigSyncMessage: string | null;
	expandedViewOpen: boolean;
};
