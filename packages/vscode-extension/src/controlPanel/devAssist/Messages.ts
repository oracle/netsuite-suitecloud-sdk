/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ClineScope, SuiteCloudPanelState } from './State';

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
