/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { parseStringPromise } from 'xml2js';

import { ErrorCodes, SdkError } from '../api/types/SdkError';
import { TranslationKeys } from '../services/translation/TranslationKeys';
import { translationService } from '../services/translation/TranslationService';
import { loadTemplate, renderTemplate } from './TemplateLoader';

const SUITESCRIPT_TEMPLATE_FOLDER = 'suitescript';
const TEMPLATE_CATALOG_FILE = 'ss_2_x_templates.xml';
const MODULE_CATALOG_FILE = 'suitescript_modules.xml';
const DEFAULT_TEMPLATE_ID = 'CustomModule';

type SuiteScriptTemplate = {
	id: string;
	headerFilename?: string;
	bodyFilename: string;
};

type TemplateCatalog = {
	configuration: {
		templates: Array<{
			template: Array<{
				$: { id: string; headerFilename?: string };
				types: Array<{ files: Array<{ $: { bodyFilename: string } }> }>;
			}>;
		}>;
	};
};

type ModuleCatalog = {
	ss_modules: {
		ss_module: Array<{ $: { path: string } }>;
	};
};

let templatesPromise: Promise<SuiteScriptTemplate[]> | undefined;
let modulesPromise: Promise<string[]> | undefined;

export async function generateSuiteScriptTemplate(
	type: string | undefined,
	moduleValue: string | string[] | undefined
): Promise<string> {
	const templates = await getTemplates();
	const requestedType = type || DEFAULT_TEMPLATE_ID;
	const selectedTemplate = templates.find(
		(template) => template.id.toLowerCase() === requestedType.toLowerCase()
	);

	if (!selectedTemplate) {
		throw new SdkError(
			translationService.getMessage(
				TranslationKeys.SUITESCRIPT.ERROR.INVALID_TYPE,
				templates.map(({ id }) => id).join(', ')
			),
			ErrorCodes.INVALID_SUITESCRIPT_TYPE
		);
	}

	const modules = await normalizeModules(moduleValue);
	const header = selectedTemplate.headerFilename
		? await loadSuiteScriptTemplate(selectedTemplate.headerFilename)
		: '';
	const body = await loadSuiteScriptTemplate(selectedTemplate.bodyFilename);

	return renderTemplate(header + body, {
		modulesDefine: modules.map((moduleId) => `'${moduleId}'`).join(', '),
		modulesJsDoc: buildModulesJsDoc(modules, body.includes('\r\n') ? '\r\n' : '\n'),
		moduleParameters: modules.map(getModuleName).join(', '),
	});
}

async function getTemplates(): Promise<SuiteScriptTemplate[]> {
	if (!templatesPromise) {
		templatesPromise = loadSuiteScriptTemplate(TEMPLATE_CATALOG_FILE).then(async (catalog) => {
			const parsedCatalog = (await parseStringPromise(catalog)) as TemplateCatalog;
			return parsedCatalog.configuration.templates[0].template.map((template) => ({
				id: template.$.id,
				headerFilename: template.$.headerFilename,
				bodyFilename: template.types[0].files[0].$.bodyFilename,
			}));
		});
	}
	return templatesPromise;
}

async function getSupportedModules(): Promise<string[]> {
	if (!modulesPromise) {
		modulesPromise = loadSuiteScriptTemplate(MODULE_CATALOG_FILE).then(async (catalog) => {
			const parsedCatalog = (await parseStringPromise(catalog)) as ModuleCatalog;
			return parsedCatalog.ss_modules.ss_module.map((module) => module.$.path);
		});
	}
	return modulesPromise;
}

async function normalizeModules(moduleValue: string | string[] | undefined): Promise<string[]> {
	const requestedModules = parseModules(moduleValue);
	const supportedModules = await getSupportedModules();
	const supportedModulesByLowercaseId = new Map(
		supportedModules.map((moduleId) => [moduleId.toLowerCase(), moduleId])
	);
	const normalizedModules: string[] = [];
	const invalidModules: string[] = [];

	for (const requestedModule of requestedModules) {
		const supportedModule = supportedModulesByLowercaseId.get(requestedModule.toLowerCase());
		if (supportedModule) {
			normalizedModules.push(supportedModule);
		} else {
			invalidModules.push(requestedModule);
		}
	}

	if (invalidModules.length > 0) {
		throw new SdkError(
			translationService.getMessage(
				TranslationKeys.SUITESCRIPT.ERROR.INVALID_MODULES,
				invalidModules.map((moduleId) => `"${moduleId}"`).join(', ')
			),
			ErrorCodes.INVALID_SUITESCRIPT_MODULE
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
