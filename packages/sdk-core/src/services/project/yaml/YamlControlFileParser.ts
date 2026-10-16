/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { parseDocument } from 'yaml';
import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';

export function parseYamlDocument(contents: string, filename: string): unknown {
	try {
		const document = parseDocument(contents, { version: '1.2', stringKeys: true });
		if (document.errors.length) {
			throw new Error(document.errors.map((error) => error.message).join('\n'));
		}
		return document.toJS({ maxAliasCount: 100 });
	} catch (error) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.DOCUMENT_INVALID, filename, (error as Error).message));
	}
}
