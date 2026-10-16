/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';
import type { DeployScript, ProjectDeploySkeleton, ProjectManifestSkeleton } from '../SuiteCloudControlFileTypes';
import { createProjectDeploySkeleton, getDeployPathGroup } from '../utils/ProjectDeployNormalizerUtils';
import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';

const { MANIFEST, DEPLOY } = CONTROL_FILE_FIELDS;

// JSON and YAML share normalization without modifying the parsed document.
export function normalizeSdfV2Manifest(document: unknown, filename: string): ProjectManifestSkeleton {
	const rootPath = `/${MANIFEST.ROOT}`;
	const manifest = requireMapping(getRoot(document, filename, MANIFEST.ROOT), filename, rootPath);
	const publisherId = scalarText(manifest[MANIFEST.PUBLISHER_ID]);
	const projectId = scalarText(manifest[MANIFEST.PROJECT_ID]);
	return {
		projectType: scalarText(manifest[MANIFEST.PROJECT_TYPE]),
		projectName: scalarText(manifest[MANIFEST.PROJECT_NAME]),
		publisherId,
		projectId,
		applicationId: publisherId && projectId ? `${publisherId}.${projectId}` : undefined,
		projectVersion: scalarText(manifest[MANIFEST.PROJECT_VERSION]),
		frameworkVersion: scalarText(manifest[MANIFEST.FRAMEWORK_VERSION]),
		// TODO: Implement ManifestDependencies Normalization (as of now it's not required).
		dependencies: undefined,
	};
}

export function normalizeSdfV2Deploy(document: unknown, filename: string): ProjectDeploySkeleton {
	const deploy = getRoot(document, filename, DEPLOY.ROOT);
	const rootPath = `/${DEPLOY.ROOT}`;
	const result = createProjectDeploySkeleton();
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
		if (kind === DEPLOY.RUN) {
			result.run.push(...normalizeScripts(group[DEPLOY.SCRIPT], filename, `${propertyPath}/${DEPLOY.SCRIPT}`));
		} else {
			const paths = getDeployPathGroup(result, kind, filename, propertyPath);
			paths.push(...asList(group[DEPLOY.PATH]).map(scalarText));
		}
	}
	return result;
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
			path: scalarText(script[DEPLOY.PATH]),
			deployment: scalarText(script[DEPLOY.DEPLOYMENT]),
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
