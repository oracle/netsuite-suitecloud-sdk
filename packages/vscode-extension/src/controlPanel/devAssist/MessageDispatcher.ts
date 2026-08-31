/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import {
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelSubmitFeedbackPayload,
	SuiteCloudPanelUpdateFormPayload,
	SUITECLOUD_PANEL_EVENTS,
} from './Messages';

export type ControlPanelMessageHandlers = {
	load: () => Promise<void>;
	openExpandedView: () => void;
	copyApiKey: () => Promise<void>;
	updateForm: (payload: SuiteCloudPanelUpdateFormPayload) => Promise<void>;
	startProxy: (payload: SuiteCloudPanelUpdateFormPayload) => Promise<void>;
	stopProxy: () => Promise<void>;
	refreshAuthIds: () => Promise<void>;
	setupAccount: () => Promise<void>;
	rotateApiKey: () => Promise<void>;
	applyClineSettings: () => Promise<void>;
	openClineMarketplace: () => Promise<void>;
	openOutput: () => void;
	openClineChat: () => Promise<void>;
	submitFeedback: (payload: SuiteCloudPanelSubmitFeedbackPayload) => Promise<void>;
};

const assertUnreachable = (value: never): never => {
	throw new Error(`Unhandled control panel event: ${String(value)}`);
};

export default class MessageDispatcher {
	constructor(private readonly _handlers: ControlPanelMessageHandlers) {}

	async dispatch(message: SuiteCloudPanelIncomingMessage): Promise<void> {
		switch (message.eventType) {
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.LOAD:
				await this._handlers.load();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_EXPANDED_VIEW:
				this._handlers.openExpandedView();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY:
				await this._handlers.copyApiKey();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM:
				await this._handlers.updateForm(message.eventData || {});
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY:
				await this._handlers.startProxy(message.eventData || {});
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY:
				await this._handlers.stopProxy();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.AUTH_ID_DROPDOWN_OPEN:
				await this._handlers.refreshAuthIds();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SETUP_ACCOUNT:
				await this._handlers.setupAccount();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.ROTATE_KEY:
				await this._handlers.rotateApiKey();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.APPLY_CLINE_SETTINGS:
				await this._handlers.applyClineSettings();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE:
				await this._handlers.openClineMarketplace();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_OUTPUT:
				this._handlers.openOutput();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_CHAT:
				await this._handlers.openClineChat();
				break;
			case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SUBMIT_FEEDBACK:
				await this._handlers.submitFeedback(message.eventData || {});
				break;
			default:
				assertUnreachable(message);
		}
	}
}
