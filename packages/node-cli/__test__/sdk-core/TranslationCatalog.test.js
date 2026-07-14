/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { join } = require('node:path');

const sdkCoreBuild = join(__dirname, '..', '..', '..', 'sdk-core', 'build');
const messages = require(join(sdkCoreBuild, 'data', 'messages.json'));
const { TranslationKeys } = require(
	join(sdkCoreBuild, 'services', 'translation', 'TranslationKeys.js')
);

describe('sdk-core translation catalog', () => {
	it('contains exactly one message for every declared translation key', () => {
		expect(Object.keys(messages).sort()).toEqual(flattenTranslationKeys(TranslationKeys).sort());
	});

	it('does not contain trailing whitespace', () => {
		for (const [key, message] of Object.entries(messages)) {
			expect({ key, message: message.replace(/\s+$/u, '') }).toEqual({ key, message });
		}
	});
});

function flattenTranslationKeys(value) {
	return Object.values(value).flatMap((entry) =>
		typeof entry === 'string' ? [entry] : flattenTranslationKeys(entry)
	);
}
