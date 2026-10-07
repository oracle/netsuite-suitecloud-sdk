/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { Parser } from 'xml2js';
import { PROJECT_CONTROL } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';

export type XmlNode = Record<string, any>;

export function parseXmlRoot(controlFileContents: string, filename: string, expectedRoot?: string): XmlNode {
	let parsed: XmlNode | undefined;
	let parsingError: Error | undefined;
	// The CLI facade needs synchronous metadata; async readers use this same parser after reading the file.
	new Parser({ explicitArray: false, trim: true, explicitChildren: true, preserveChildrenOrder: true, async: false })
		.parseString(controlFileContents, (error: Error | null, result: XmlNode) => {
			parsingError = error ?? undefined;
			parsed = result;
		});
	if (parsingError) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.XML_INVALID, filename, parsingError.message));
	}
	if (!parsed || typeof parsed !== 'object' || (expectedRoot && !Object.hasOwn(parsed, expectedRoot))) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.XML_ROOT_INVALID, filename, expectedRoot ?? ''));
	}
	return expectedRoot ? (parsed[expectedRoot] ?? {}) : parsed;
}

export function xmlText(value: unknown): string {
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value).trim();
	}
	if (value && typeof value === 'object' && '_' in value) {
		return xmlText((value as { _: unknown })._);
	}
	return '';
}

export function xmlChildren(node: XmlNode, name?: string): XmlNode[] {
	const children = Array.isArray(node?.$$) ? node.$$ : [];
	return children.filter((child: XmlNode) => !name || child['#name'] === name);
}
