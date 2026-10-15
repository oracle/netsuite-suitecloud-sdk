/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';
import type { ManifestDependencies } from '../SuiteCloudControlFileTypes';
import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';

const { MANIFEST } = CONTROL_FILE_FIELDS;

export function normalizeManifestDependencies(value: unknown, filename: string): ManifestDependencies | undefined {
	const rootPath = `/${MANIFEST.ROOT}/${MANIFEST.DEPENDENCIES}`;
	if (value === undefined) {
		return undefined;
	}
	const dependencies = mapping(value, rootPath);
	return {
		features: list(dependencies[MANIFEST.FEATURES], `${rootPath}/${MANIFEST.FEATURES}`)?.map((value, index) => {
			const path = `${rootPath}/${MANIFEST.FEATURES}/${index}`;
			const feature = mapping(value, path);
			const required = feature[MANIFEST.REQUIRED];
			if (required !== 'true' && required !== 'false' && typeof required !== 'boolean') {
				throw invalid(`${path}/${MANIFEST.REQUIRED}`, '"true" or "false"');
			}
			return { name: text(feature[MANIFEST.NAME], `${path}/${MANIFEST.NAME}`), required: required === true || required === 'true' };
		}),
		applications: list(dependencies[MANIFEST.APPLICATIONS], `${rootPath}/${MANIFEST.APPLICATIONS}`)?.map((value, index) => {
			const path = `${rootPath}/${MANIFEST.APPLICATIONS}/${index}`;
			const application = mapping(value, path);
			return {
				id: text(application[MANIFEST.ID], `${path}/${MANIFEST.ID}`),
				objects: texts(application[MANIFEST.OBJECTS], `${path}/${MANIFEST.OBJECTS}`),
				platformextensions: texts(application[MANIFEST.PLATFORM_EXTENSIONS], `${path}/${MANIFEST.PLATFORM_EXTENSIONS}`),
			};
		}),
		bundles: list(dependencies[MANIFEST.BUNDLES], `${rootPath}/${MANIFEST.BUNDLES}`)?.map((value, index) => {
			const path = `${rootPath}/${MANIFEST.BUNDLES}/${index}`;
			const bundle = mapping(value, path);
			return { id: text(bundle[MANIFEST.ID], `${path}/${MANIFEST.ID}`), objects: texts(bundle[MANIFEST.OBJECTS], `${path}/${MANIFEST.OBJECTS}`) };
		}),
		files: texts(dependencies[MANIFEST.FILES], `${rootPath}/${MANIFEST.FILES}`),
		folders: texts(dependencies[MANIFEST.FOLDERS], `${rootPath}/${MANIFEST.FOLDERS}`),
		objects: texts(dependencies[MANIFEST.OBJECTS], `${rootPath}/${MANIFEST.OBJECTS}`),
		platformextensions: texts(dependencies[MANIFEST.PLATFORM_EXTENSIONS], `${rootPath}/${MANIFEST.PLATFORM_EXTENSIONS}`),
	};

	function invalid(path: string, expected: string): Error {
		return new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, path, expected));
	}

	function mapping(value: unknown, path: string): Record<string, unknown> {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			throw invalid(path, 'an object');
		}
		return value as Record<string, unknown>;
	}

	function list(value: unknown, path: string): unknown[] | undefined {
		if (value === undefined) {
			return undefined;
		}
		if (!Array.isArray(value)) {
			throw invalid(path, 'an array');
		}
		return value;
	}

	function text(value: unknown, path: string): string {
		if (typeof value !== 'string') {
			throw invalid(path, 'a string');
		}
		return value.trim();
	}

	function texts(value: unknown, path: string): string[] | undefined {
		return list(value, path)?.map((entry, index) => text(entry, `${path}/${index}`));
	}
}
