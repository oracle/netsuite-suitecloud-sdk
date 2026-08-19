/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import messages from '../../data/messages.json';

export type TranslationKey = keyof typeof messages;

export class TranslationService {
	getMessage(key: TranslationKey, ...params: Array<string | number>): string {
		return messages[key].replace(/{(\d+)}/g, (placeholder, index: string) => {
			const value = params[Number(index)];
			return value === undefined ? placeholder : String(value);
		});
	}
}

export const translationService = new TranslationService();
