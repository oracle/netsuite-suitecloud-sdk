/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import { CONTROL_PANEL, SUITECLOUD_PROXY } from '../../service/TranslationKeys';
import { VSTranslationService } from '../../service/VSTranslationService';
import { SUITECLOUD_PANEL_CLIENT_STRINGS } from '../../controlPanel/view/PanelStrings';

const collectKeys = (value: unknown): string[] => {
	if (typeof value === 'string') {
		return [value];
	}
	if (!value || typeof value !== 'object') {
		return [];
	}
	return Object.values(value).flatMap(collectKeys);
};

suite('Control Panel Translations', () => {
	test('resolves every control panel translation key', () => {
		const translationService = new VSTranslationService();
		for (const key of collectKeys({ CONTROL_PANEL, SUITECLOUD_PROXY })) {
			const translatedMessage = translationService.getMessage(key);
			assert.strictEqual(typeof translatedMessage, 'string', key);
			assert.ok(translatedMessage.length > 0, key);
		}
	});

	test('provides only serializable strings to the webview client', () => {
		const serializedStrings = JSON.parse(
			JSON.stringify(SUITECLOUD_PANEL_CLIENT_STRINGS)
		) as Record<string, unknown>;
		assert.deepStrictEqual(
			Object.keys(serializedStrings),
			Object.keys(SUITECLOUD_PANEL_CLIENT_STRINGS)
		);
		Object.entries(serializedStrings).forEach(([key, value]) => {
			assert.strictEqual(typeof value, 'string', key);
			assert.ok((value as string).length > 0, key);
		});
	});
});
