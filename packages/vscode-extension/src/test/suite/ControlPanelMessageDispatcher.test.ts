/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import MessageDispatcher, {
	ControlPanelMessageHandlers,
} from '../../controlPanel/devAssist/MessageDispatcher';
import { SUITECLOUD_PANEL_EVENTS } from '../../controlPanel/devAssist/Messages';

suite('Control Panel Message Dispatcher', () => {
	test('routes every webview event to its matching handler', async () => {
		const calls: Array<{ name: string; payload?: unknown }> = [];
		const handlers: ControlPanelMessageHandlers = {
			load: async () => { calls.push({ name: 'load' }); },
			openExpandedView: () => { calls.push({ name: 'openExpandedView' }); },
			copyApiKey: async () => { calls.push({ name: 'copyApiKey' }); },
			updateForm: async (payload) => { calls.push({ name: 'updateForm', payload }); },
			startProxy: async (payload) => { calls.push({ name: 'startProxy', payload }); },
			stopProxy: async () => { calls.push({ name: 'stopProxy' }); },
			refreshAuthIds: async () => { calls.push({ name: 'refreshAuthIds' }); },
			setupAccount: async () => { calls.push({ name: 'setupAccount' }); },
			rotateApiKey: async () => { calls.push({ name: 'rotateApiKey' }); },
			applyClineSettings: async () => { calls.push({ name: 'applyClineSettings' }); },
			openClineMarketplace: async () => { calls.push({ name: 'openClineMarketplace' }); },
			openOutput: () => { calls.push({ name: 'openOutput' }); },
			openClineChat: async () => { calls.push({ name: 'openClineChat' }); },
			submitFeedback: async (payload) => { calls.push({ name: 'submitFeedback', payload }); },
		};
		const dispatcher = new MessageDispatcher(handlers);
		const formPayload = { authId: 'account', port: 8181 };
		const feedbackPayload = { feedback: 'useful', rating: 5 };

		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.LOAD });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_EXPANDED_VIEW });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM, eventData: formPayload });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY, eventData: formPayload });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.AUTH_ID_DROPDOWN_OPEN });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SETUP_ACCOUNT });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.ROTATE_KEY });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.APPLY_CLINE_SETTINGS });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_OUTPUT });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_CHAT });
		await dispatcher.dispatch({ eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SUBMIT_FEEDBACK, eventData: feedbackPayload });

		assert.deepStrictEqual(calls, [
			{ name: 'load' },
			{ name: 'openExpandedView' },
			{ name: 'copyApiKey' },
			{ name: 'updateForm', payload: formPayload },
			{ name: 'startProxy', payload: formPayload },
			{ name: 'stopProxy' },
			{ name: 'refreshAuthIds' },
			{ name: 'setupAccount' },
			{ name: 'rotateApiKey' },
			{ name: 'applyClineSettings' },
			{ name: 'openClineMarketplace' },
			{ name: 'openOutput' },
			{ name: 'openClineChat' },
			{ name: 'submitFeedback', payload: feedbackPayload },
		]);
	});
});
