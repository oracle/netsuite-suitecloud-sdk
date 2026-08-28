/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import {
	parseSuiteCloudPanelIncomingMessage,
	SUITECLOUD_PANEL_EVENTS,
} from '../../panel/SuiteCloudPanelTypes';

suite('SuiteCloud Control Panel Message Parser', () => {
	test('parses simple valid event', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.LOAD,
		});

		assert.deepStrictEqual(message, { eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.LOAD });
	});

	test('parses Cline Marketplace navigation as a payload-free event', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE,
		});

		assert.deepStrictEqual(message, {
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE,
		});
	});

	test('parses API key copy as a payload-free privileged event', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY,
		});

		assert.deepStrictEqual(message, {
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY,
		});
	});

	test('parses Auth ID dropdown refresh as a payload-free event', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.AUTH_ID_DROPDOWN_OPEN,
		});

		assert.deepStrictEqual(message, {
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.AUTH_ID_DROPDOWN_OPEN,
		});
	});

	test('parses SuiteCloud account setup as a payload-free event', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SETUP_ACCOUNT,
		});

		assert.deepStrictEqual(message, {
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SETUP_ACCOUNT,
		});
	});

	test('parses start proxy event with current form values', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY,
			eventData: {
				authId: 'dev-account',
				port: 8284,
			},
		});

		assert.deepStrictEqual(message, {
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY,
			eventData: {
				authId: 'dev-account',
				port: 8284,
			},
		});
	});

	test('parses the retained reminder preference', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM,
			eventData: {
				disableWelcomeNotification: true,
			},
		});

		assert.deepStrictEqual(message, {
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM,
			eventData: {
				disableWelcomeNotification: true,
			},
		});
	});

	test('rejects unknown event type', () => {
		const message = parseSuiteCloudPanelIncomingMessage({ eventType: 'UNKNOWN_EVENT' });
		assert.strictEqual(message, undefined);
	});

	test('rejects non-record payload', () => {
		const message = parseSuiteCloudPanelIncomingMessage('LOAD');
		assert.strictEqual(message, undefined);
	});

	test('rejects update form event with non-object payload', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM,
			eventData: 123,
		});
		assert.strictEqual(message, undefined);
	});

	test('rejects start proxy event with non-object form values', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY,
			eventData: 8284,
		});
		assert.strictEqual(message, undefined);
	});

	test('rejects form fields outside the explicit message schema', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM,
			eventData: { port: 8284, injected: true },
		});
		assert.strictEqual(message, undefined);
	});

	test('rejects removed auto-start and Cline auto-apply controls', () => {
		for (const removedField of ['autoStartProxyOnStartup', 'clineSyncEnabled']) {
			const message = parseSuiteCloudPanelIncomingMessage({
				eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM,
				eventData: { [removedField]: true },
			});
			assert.strictEqual(message, undefined);
		}
	});

	test('rejects ports outside the proxy range', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM,
			eventData: { port: 80 },
		});
		assert.strictEqual(message, undefined);
	});

	test('rejects payloads on payload-free privileged events', () => {
		const message = parseSuiteCloudPanelIncomingMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY,
			eventData: { value: 'attempted-secret-injection' },
		});
		assert.strictEqual(message, undefined);
	});
});
