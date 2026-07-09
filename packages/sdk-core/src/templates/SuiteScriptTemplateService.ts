/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { TranslationKeys } from '../services/translation/TranslationKeys';
import { translationService } from '../services/translation/TranslationService';
import {
	DEFAULT_SUITESCRIPT_TEMPLATE_ID,
	SUITESCRIPT_HEADER_FILENAME,
	SUITESCRIPT_MODULES,
	SUITESCRIPT_TEMPLATES,
} from './SuiteScriptCatalog';
import { loadTemplate, renderTemplate } from './TemplateLoader';

const SUITESCRIPT_TEMPLATE_FOLDER = 'suitescript';
const templatesByLowercaseId = new Map(
	SUITESCRIPT_TEMPLATES.map((template) => [template.id.toLowerCase(), template])
);
const modulesByLowercaseId = new Map(
	SUITESCRIPT_MODULES.map((moduleId) => [moduleId.toLowerCase(), moduleId])
);

export async function generateSuiteScriptTemplate(
	type: string | undefined,
	moduleValue: string | string[] | undefined
): Promise<string> {
	const requestedType = type || DEFAULT_SUITESCRIPT_TEMPLATE_ID;
	const selectedTemplate = templatesByLowercaseId.get(requestedType.toLowerCase());

	if (!selectedTemplate) {
		throw new Error(
			translationService.getMessage(
				TranslationKeys.SUITESCRIPT.ERROR.INVALID_TYPE,
				SUITESCRIPT_TEMPLATES.map(({ id }) => id).join(', ')
			)
		);
	}

	const modules = normalizeModules(moduleValue);
	const [header, body] = await Promise.all([
		loadSuiteScriptTemplate(SUITESCRIPT_HEADER_FILENAME),
		loadSuiteScriptTemplate(selectedTemplate.bodyFilename),
	]);

	return renderTemplate(header + body, {
		modulesDefine: modules.map((moduleId) => `'${moduleId}'`).join(', '),
		modulesJsDoc: buildModulesJsDoc(modules, body.includes('\r\n') ? '\r\n' : '\n'),
		moduleParameters: modules.map(getModuleName).join(', '),
	});
}

function normalizeModules(moduleValue: string | string[] | undefined): string[] {
	const requestedModules = parseModules(moduleValue);
	const normalizedModules: string[] = [];
	const invalidModules: string[] = [];

	for (const requestedModule of requestedModules) {
		const supportedModule = modulesByLowercaseId.get(requestedModule.toLowerCase());
		if (supportedModule) {
			normalizedModules.push(supportedModule);
		} else {
			invalidModules.push(requestedModule);
		}
	}

	if (invalidModules.length > 0) {
		throw new Error(
			translationService.getMessage(
				TranslationKeys.SUITESCRIPT.ERROR.INVALID_MODULES,
				invalidModules.map((moduleId) => `"${moduleId}"`).join(', ')
			)
		);
	}

	return normalizedModules;
}

function parseModules(moduleValue: string | string[] | undefined): string[] {
	if (Array.isArray(moduleValue)) {
		return moduleValue.map(stripQuotes).filter(Boolean);
	}
	if (!moduleValue) {
		return [];
	}

	const modules: string[] = [];
	for (const match of String(moduleValue).matchAll(/"([^"]+)"|'([^']+)'|([^\s]+)/g)) {
		modules.push(stripQuotes(match[1] || match[2] || match[3]));
	}
	return modules.filter(Boolean);
}

function buildModulesJsDoc(modules: string[], lineEnding: string): string {
	if (modules.length === 0) {
		return '';
	}

	return [
		'/**',
		...modules.map((moduleId) => ` * @param{${getModuleName(moduleId)}} ${getModuleName(moduleId)}`),
		' */',
	].join(lineEnding);
}

function getModuleName(moduleId: string): string {
	return moduleId.split('/').pop() || moduleId;
}

function stripQuotes(value: string): string {
	return value.replace(/^['"]|['"]$/g, '').trim();
}

function loadSuiteScriptTemplate(filename: string): Promise<string> {
	return loadTemplate(`${SUITESCRIPT_TEMPLATE_FOLDER}/${filename}`);
}
