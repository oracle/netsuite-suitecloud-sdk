/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const TEMPLATE_ROOT = join(__dirname, '..', 'resources', 'templates');
const templateCache = new Map<string, Promise<string>>();

export function loadTemplate(relativePath: string): Promise<string> {
	let template = templateCache.get(relativePath);
	if (!template) {
		template = readFile(join(TEMPLATE_ROOT, relativePath), 'utf8');
		templateCache.set(relativePath, template);
	}
	return template;
}

export function renderTemplate(template: string, values: Record<string, string>): string {
	return Object.entries(values).reduce((content, [name, value]) => {
		return content
			.replaceAll(`\${${name}}`, value)
			.replaceAll(`{{${name}}}`, value);
	}, template);
}

export function setXmlElementValues(template: string, values: Record<string, string>): string {
	return Object.entries(values).reduce((content, [element, value]) => {
		const emptyElement = new RegExp(`<${element}>\\s*</${element}>`, 'i');
		return content.replace(emptyElement, `<${element}>${escapeXml(value)}</${element}>`);
	}, template);
}

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}
