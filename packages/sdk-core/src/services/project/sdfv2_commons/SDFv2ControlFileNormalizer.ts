/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';
import type { DeployGroup, DeployScript, ProjectManifest } from '../SuiteCloudControlFileTypes';
import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';

// JSON and YAML share normalization without modifying the parsed document.
export function normalizeSdfV2Manifest(document: unknown, filename: string): ProjectManifest {
	const rootPath = `/${CONTROL_FILE_FIELDS.MANIFEST}`;
	const manifest = requireMapping(getRoot(document, filename, CONTROL_FILE_FIELDS.MANIFEST), filename, rootPath);
	const publisherId = scalarText(manifest[CONTROL_FILE_FIELDS.PUBLISHER_ID]);
	const projectId = scalarText(manifest[CONTROL_FILE_FIELDS.PROJECT_ID]);
	return {
		projectType: scalarText(manifest[CONTROL_FILE_FIELDS.PROJECT_TYPE]),
		projectName: scalarText(manifest[CONTROL_FILE_FIELDS.PROJECT_NAME]),
		publisherId,
		projectId,
		applicationId: publisherId && projectId ? `${publisherId}.${projectId}` : undefined,
		projectVersion: scalarText(manifest[CONTROL_FILE_FIELDS.PROJECT_VERSION]),
		frameworkVersion: scalarText(manifest[CONTROL_FILE_FIELDS.FRAMEWORK_VERSION]),
		source: { file: filename, propertyPath: rootPath },
		propertyPaths: {
			projectType: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_TYPE}`,
			projectName: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_NAME}`,
			publisherId: `${rootPath}/${CONTROL_FILE_FIELDS.PUBLISHER_ID}`,
			projectId: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_ID}`,
			projectVersion: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_VERSION}`,
			frameworkVersion: `${rootPath}/${CONTROL_FILE_FIELDS.FRAMEWORK_VERSION}`,
		},
	};
}

export function normalizeSdfV2Deploy(document: unknown, filename: string): DeployGroup[] {
	const deploy = getRoot(document, filename, CONTROL_FILE_FIELDS.DEPLOY);
	const rootPath = `/${CONTROL_FILE_FIELDS.DEPLOY}`;
	const groups: DeployGroup[] = [];
	if (!Array.isArray(deploy)) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, rootPath, 'an ordered array of deploy groups'));
	}
	// Each item contains one group; the array preserves repeated groups and their order.
	for (let index = 0; index < deploy.length; index++) {
		const entryPath = `${rootPath}/${index}`;
		const mapping = requireMapping(deploy[index], filename, entryPath);
		const entries = Object.entries(mapping);
		if (entries.length !== 1) {
			throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, entryPath, 'exactly one deploy group'));
		}
		const [kind, value] = entries[0];
		const propertyPath = `${entryPath}/${escapePointer(kind)}`;
		const group = requireMapping(value, filename, propertyPath);
		const paths = asList(group[CONTROL_FILE_FIELDS.PATH]).map((path, pathIndex) => ({
			value: scalarText(path),
			source: { file: filename, propertyPath: itemPath(group[CONTROL_FILE_FIELDS.PATH], `${propertyPath}/${CONTROL_FILE_FIELDS.PATH}`, pathIndex) },
		}));
		const scripts = kind === CONTROL_FILE_FIELDS.RUN
			? normalizeScripts(group[CONTROL_FILE_FIELDS.SCRIPT], filename, `${propertyPath}/${CONTROL_FILE_FIELDS.SCRIPT}`)
			: [];
		groups.push({ kind, paths, scripts, source: { file: filename, propertyPath } });
	}
	return groups;
}

function getRoot(document: unknown, filename: string, name: string): unknown {
	const mapping = requireMapping(document, filename, '/');
	if (!Object.prototype.hasOwnProperty.call(mapping, name)) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, '/', `a "${name}" root property`));
	}
	return mapping[name];
}

function requireMapping(value: unknown, filename: string, propertyPath: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, propertyPath, 'an object'));
	}
	return value as Record<string, unknown>;
}

function normalizeScripts(value: unknown, filename: string, propertyPath: string): DeployScript[] {
	return asList(value).map((entry, index) => {
		const scriptPath = itemPath(value, propertyPath, index);
		const script = requireMapping(entry, filename, scriptPath);
		return {
			path: { value: scalarText(script[CONTROL_FILE_FIELDS.PATH]), source: { file: filename, propertyPath: `${scriptPath}/${CONTROL_FILE_FIELDS.PATH}` } },
			deployment: scalarText(script[CONTROL_FILE_FIELDS.DEPLOYMENT]),
			deploymentSource: { file: filename, propertyPath: `${scriptPath}/${CONTROL_FILE_FIELDS.DEPLOYMENT}` },
			source: { file: filename, propertyPath: scriptPath },
		};
	});
}

function asList(value: unknown): unknown[] {
	return value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];
}

function itemPath(value: unknown, propertyPath: string, index: number): string {
	return Array.isArray(value) ? `${propertyPath}/${index}` : propertyPath;
}

function scalarText(value: unknown): string {
	return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value).trim() : '';
}

function escapePointer(value: string): string {
	return value.replace(/~/g, '~0').replace(/\//g, '~1');
}
