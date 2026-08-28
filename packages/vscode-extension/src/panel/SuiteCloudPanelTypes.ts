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

export const SUITECLOUD_PANEL_EVENTS = {
	FROM_WEBVIEW: {
		LOAD: 'LOAD',
		OPEN_EXPANDED_VIEW: 'OPEN_EXPANDED_VIEW',
		COPY_API_KEY: 'COPY_API_KEY',
		START_PROXY: 'START_PROXY',
		STOP_PROXY: 'STOP_PROXY',
		AUTH_ID_DROPDOWN_OPEN: 'AUTH_ID_DROPDOWN_OPEN',
		SETUP_ACCOUNT: 'SETUP_ACCOUNT',
		ROTATE_KEY: 'ROTATE_KEY',
		APPLY_CLINE_SETTINGS: 'APPLY_CLINE_SETTINGS',
		OPEN_CLINE_MARKETPLACE: 'OPEN_CLINE_MARKETPLACE',
		OPEN_OUTPUT: 'OPEN_OUTPUT',
		OPEN_CLINE_CHAT: 'OPEN_CLINE_CHAT',
		SUBMIT_FEEDBACK: 'SUBMIT_FEEDBACK',
		UPDATE_FORM: 'UPDATE_FORM',
	},
	TO_WEBVIEW: {
		STATE_UPDATE: 'STATE_UPDATE',
		ACTION_SUCCESS: 'ACTION_SUCCESS',
	},
} as const;

export type SuiteCloudPanelUpdateFormPayload = {
	authId?: string;
	port?: number;
	clineScope?: ClineScope;
	disableWelcomeNotification?: boolean;
};

export type SuiteCloudPanelSubmitFeedbackPayload = {
	feedback?: string;
	topics?: string[];
	rating?: number;
};

type SuiteCloudPanelFromWebviewEvents = typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW;
type SuiteCloudPanelToWebviewEvents = typeof SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW;

export type SuiteCloudPanelFromWebviewEventType =
	SuiteCloudPanelFromWebviewEvents[keyof SuiteCloudPanelFromWebviewEvents];

export type SuiteCloudPanelToWebviewEventType =
	SuiteCloudPanelToWebviewEvents[keyof SuiteCloudPanelToWebviewEvents];

export type SuiteCloudPanelAction = 'SUBMIT_FEEDBACK';

export type SuiteCloudPanelIncomingMessage =
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.LOAD }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_EXPANDED_VIEW }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY }
	| {
			eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY;
			eventData?: SuiteCloudPanelUpdateFormPayload;
	  }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.AUTH_ID_DROPDOWN_OPEN }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SETUP_ACCOUNT }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.ROTATE_KEY }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.APPLY_CLINE_SETTINGS }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_OUTPUT }
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_CHAT }
	| {
			eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SUBMIT_FEEDBACK;
			eventData?: SuiteCloudPanelSubmitFeedbackPayload;
	  }
	| {
			eventType: typeof SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM;
			eventData?: SuiteCloudPanelUpdateFormPayload;
	  };

export type SuiteCloudPanelOutgoingMessage =
	| { eventType: typeof SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.STATE_UPDATE; eventData: SuiteCloudPanelState }
	| {
			eventType: typeof SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.ACTION_SUCCESS;
			eventData: { message: string; action?: SuiteCloudPanelAction };
	  };

const FROM_WEBVIEW_EVENT_SET: ReadonlySet<string> = new Set(
	Object.values(SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW)
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const hasOnlyKeys = (value: Record<string, unknown>, allowedKeys: ReadonlySet<string>): boolean =>
	Object.keys(value).every((key) => allowedKeys.has(key));

const parseFormPayload = (value: unknown): SuiteCloudPanelUpdateFormPayload | undefined => {
	if (!isRecord(value)) {
		return undefined;
	}
	const allowedKeys = new Set([
		'authId',
		'port',
		'clineScope',
		'disableWelcomeNotification',
	]);
	if (!hasOnlyKeys(value, allowedKeys)) {
		return undefined;
	}
	if (value.authId !== undefined && (typeof value.authId !== 'string' || value.authId.length > 256)) {
		return undefined;
	}
	if (
		value.port !== undefined &&
		(!Number.isInteger(value.port) || (value.port as number) < 1024 || (value.port as number) > 65535)
	) {
		return undefined;
	}
	if (value.clineScope !== undefined && value.clineScope !== 'user' && value.clineScope !== 'workspace') {
		return undefined;
	}
	const booleanKeys = ['disableWelcomeNotification'];
	if (booleanKeys.some((key) => value[key] !== undefined && typeof value[key] !== 'boolean')) {
		return undefined;
	}
	return value as SuiteCloudPanelUpdateFormPayload;
};

const parseFeedbackPayload = (value: unknown): SuiteCloudPanelSubmitFeedbackPayload | undefined => {
	if (!isRecord(value) || !hasOnlyKeys(value, new Set(['feedback', 'topics', 'rating']))) {
		return undefined;
	}
	if (value.feedback !== undefined && (typeof value.feedback !== 'string' || value.feedback.length > 1000)) {
		return undefined;
	}
	if (
		value.topics !== undefined &&
		(
			!Array.isArray(value.topics) ||
			value.topics.length > 5 ||
			value.topics.some((topic) => typeof topic !== 'string' || topic.length > 64)
		)
	) {
		return undefined;
	}
	if (value.rating !== undefined && (typeof value.rating !== 'number' || !Number.isFinite(value.rating))) {
		return undefined;
	}
	return value as SuiteCloudPanelSubmitFeedbackPayload;
};

export const parseSuiteCloudPanelIncomingMessage = (
	rawMessage: unknown
): SuiteCloudPanelIncomingMessage | undefined => {
	if (!isRecord(rawMessage) || typeof rawMessage.eventType !== 'string') {
		return undefined;
	}

	if (!FROM_WEBVIEW_EVENT_SET.has(rawMessage.eventType)) {
		return undefined;
	}

	const eventType = rawMessage.eventType as SuiteCloudPanelFromWebviewEventType;
	const rawEventData = rawMessage.eventData;

	if (
		eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM ||
		eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY
	) {
		const eventData = rawEventData === undefined ? undefined : parseFormPayload(rawEventData);
		if (rawEventData === undefined || eventData) {
			return {
				eventType,
				eventData,
			};
		}
		return undefined;
	}

	if (eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SUBMIT_FEEDBACK) {
		const eventData = rawEventData === undefined ? undefined : parseFeedbackPayload(rawEventData);
		if (rawEventData === undefined || eventData) {
			return {
				eventType,
				eventData,
			};
		}
		return undefined;
	}

	if (rawEventData !== undefined) {
		return undefined;
	}
	return { eventType };
};
