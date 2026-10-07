/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { readFileSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PROJECT_CONTROL } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';
import { FILES, PROJECT_TYPES, SDF_FRAMEWORK_VERSIONS } from './SuiteCloudProjectConstants';
import {
	type FileFormat,
	type SdfProjectControlFiles,
	type ProjectDescription,
	type SdfFrameworkVersion,
	type ProjectManifest,
	type SuiteCloudControlFile,
	type SuiteCloudControlFileKind,
} from './SuiteCloudControlFileTypes';
import { parseXmlDeploy } from './XmlDeployParser';
import { parseXmlManifest } from './XmlManifestParser';

const CONTROL_FILE_NAME_VALUES = new Set<string>(Object.values(FILES.FILE_NAMES));
const CONTROL_FILE_FORMAT_VALUES = new Set<string>(Object.values(FILES.FILE_FORMATS));


/** Phase 1 inspection. Later phases extend it with content and path validation. */
export async function inspectProjectControls(projectFolder: string): Promise<ProjectDescription> {
	const manifest = getProjectManifestFile(projectFolder);
	const controlFiles = discoverProjectControlsSync(projectFolder);
	const deployContents = await readFile(controlFiles.deploy.filepath, 'utf8');
	const deployGroups = parseXmlDeploy(deployContents, controlFiles.deploy.filename);
	return { controlFiles, manifest, deployGroups };
}


export function getProjectManifestFile(projectFolder: string): ProjectManifest {
	const controlFiles = discoverProjectControlsSync(projectFolder);
	assertXmlGeneration(controlFiles);
	const fileContents = readFileSync(controlFiles.manifest.filepath, 'utf8');
	return parseManifestMetadata(fileContents, controlFiles.manifest.filename);
}


/** Discover control files without reading their contents. */
export function discoverProjectControlsSync(projectFolder: string): SdfProjectControlFiles {
	return selectControlFiles(readdirSync(projectFolder, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name), projectFolder);
}


function selectControlFiles(filenames: string[], projectFolder: string): SdfProjectControlFiles {
	const files: Record<SuiteCloudControlFileKind, SuiteCloudControlFile[]> = {
		[FILES.FILE_NAMES.MANIFEST]: [],
		[FILES.FILE_NAMES.DEPLOY]: [],
	};
	for (const filename of filenames) {
		const dot = filename.lastIndexOf(FILES.DELIMITER);
		const fileStem = filename.slice(0, dot);
		const fileExtension = filename.slice(dot + 1);
		if (dot < 0 || !CONTROL_FILE_NAME_VALUES.has(fileStem) || !CONTROL_FILE_FORMAT_VALUES.has(fileExtension)) {
			continue;
		}
		const kind = fileStem as SuiteCloudControlFileKind;
		const format = fileExtension as FileFormat;
		files[kind].push({ kind, filename, filepath: resolve(projectFolder, filename), format });
	}

	for (const kind of Object.values(FILES.FILE_NAMES)) {
		if (files[kind].length > 1) {
			throw new Error(
				translationService.getMessage(
					PROJECT_CONTROL.ERROR.DUPLICATE,
					kind,
					files[kind].map((file) => file.filename).join(', ')
				)
			);
		}
	}
	for (const kind of [FILES.FILE_NAMES.MANIFEST, FILES.FILE_NAMES.DEPLOY]) {
		if (!files[kind].length) {
			throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.MISSING, kind, projectFolder));
		}
	}

	const manifest = files[FILES.FILE_NAMES.MANIFEST][0];
	const deploy = files[FILES.FILE_NAMES.DEPLOY][0];
	const sdfFrameworkVersion: SdfFrameworkVersion = manifest.format === FILES.FILE_FORMATS.XML
		? SDF_FRAMEWORK_VERSIONS.SDFv1
		: SDF_FRAMEWORK_VERSIONS.SDFv2;
	if ((deploy.format === FILES.FILE_FORMATS.XML) !== (manifest.format === FILES.FILE_FORMATS.XML)) {
		throw new Error(
			translationService.getMessage(
				PROJECT_CONTROL.ERROR.MIXED_GENERATION,
				[manifest, deploy].map((file) => file.filename).join(', ')
			)
		);
	}
	return { sdfFrameworkVersion, manifest, deploy };
}

//TODO: Update or remove method
function assertXmlGeneration(files: SdfProjectControlFiles): void {
	if (files.sdfFrameworkVersion === SDF_FRAMEWORK_VERSIONS.SDFv2) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.FORMAT_UNSUPPORTED, files.manifest.filename));
	}
}

function parseManifestMetadata(contents: string, filename: string): ProjectManifest {
	const manifest = parseXmlManifest(contents, filename);
	if (!manifest.projectType) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.PROJECT_TYPE_MISSING, filename));
	}
	if (manifest.projectType !== PROJECT_TYPES.ACP && manifest.projectType !== PROJECT_TYPES.SUITEAPP) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.PROJECT_TYPE_INVALID, filename));
	}
	return manifest;
}
