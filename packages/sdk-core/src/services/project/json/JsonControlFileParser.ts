/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';

export function parseJsonDocument(contents: string, filename: string): unknown {
	try {
		return JSON.parse(contents);
	} catch (error) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.DOCUMENT_INVALID, filename, (error as Error).message));
	}
}
