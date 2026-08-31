/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import {
	SuiteCloudPanelFromWebviewEventType,
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelSubmitFeedbackPayload,
	SuiteCloudPanelUpdateFormPayload,
	SUITECLOUD_PANEL_EVENTS,
} from './Messages';

const FROM_WEBVIEW_EVENT_SET: ReadonlySet<string> = new Set(
	Object.values(SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW)
);
const FORM_PAYLOAD_KEYS: ReadonlySet<string> = new Set([
	'authId',
	'port',
	'clineScope',
	'disableWelcomeNotification',
]);
const FEEDBACK_PAYLOAD_KEYS: ReadonlySet<string> = new Set([
	'feedback',
	'topics',
	'rating',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const hasOnlyKeys = (value: Record<string, unknown>, allowedKeys: ReadonlySet<string>): boolean =>
	Object.keys(value).every((key) => allowedKeys.has(key));

const parseFormPayload = (value: unknown): SuiteCloudPanelUpdateFormPayload | undefined => {
	if (!isRecord(value) || !hasOnlyKeys(value, FORM_PAYLOAD_KEYS)) {
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
	if (
		value.disableWelcomeNotification !== undefined &&
		typeof value.disableWelcomeNotification !== 'boolean'
	) {
		return undefined;
	}
	return value as SuiteCloudPanelUpdateFormPayload;
};

const parseFeedbackPayload = (value: unknown): SuiteCloudPanelSubmitFeedbackPayload | undefined => {
	if (!isRecord(value) || !hasOnlyKeys(value, FEEDBACK_PAYLOAD_KEYS)) {
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
			return { eventType, eventData };
		}
		return undefined;
	}

	if (eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SUBMIT_FEEDBACK) {
		const eventData = rawEventData === undefined ? undefined : parseFeedbackPayload(rawEventData);
		if (rawEventData === undefined || eventData) {
			return { eventType, eventData };
		}
		return undefined;
	}

	if (rawEventData !== undefined) {
		return undefined;
	}
	return { eventType };
};
