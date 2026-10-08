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
import { getControlFileAdapter } from './ControlFileAdapterRegistry';

const CONTROL_FILE_NAME_VALUES = new Set<string>(Object.values(FILES.FILE_NAMES));
const CONTROL_FILE_FORMAT_VALUES = new Set<string>(Object.values(FILES.FILE_FORMATS));


/** Verify and get Manifest File Content's in project folder */
export function getProjectManifestFile(projectFolder: string): ProjectManifest {
	const candidates = discoverAllControlFileCandidates(projectFolder);
	const manifest = validateControlFileSetup(candidates, FILES.FILE_NAMES.MANIFEST, projectFolder);
	const fileContents = readFileSync(manifest.filepath, 'utf8');
	return parseManifestMetadata(fileContents, manifest);
}


/** Phase 1 inspection. Later phases extend it with content and path validation. */
export async function inspectControlFilesAndGetProjectDescription(projectFolder: string): Promise<ProjectDescription> {
	const controlFiles = getProjectControlFiles(projectFolder);
	const [manifestContents, deployContents] = await Promise.all([
		readFile(controlFiles.manifest.filepath, 'utf8'),
		readFile(controlFiles.deploy.filepath, 'utf8'),
	]);
	const manifest = parseManifestMetadata(manifestContents, controlFiles.manifest);
	const deployAdapter = getControlFileAdapter(controlFiles.deploy);
	const deployDocument = deployAdapter.parseDocument(deployContents, controlFiles.deploy.filename);
	const deployGroups = deployAdapter.normalizeDeploy(deployDocument, controlFiles.deploy.filename);
	// ignoring application control file on purpose here

	return { controlFiles, manifest, deployGroups };
}


/** Get list of Project control files without reading their contents. Validates for not missing, no duplicates and valid SDFv1/SDFv2 setups */
export function getProjectControlFiles(projectFolder: string): SdfProjectControlFiles {
	const candidates = discoverAllControlFileCandidates(projectFolder);
	const manifest = validateControlFileSetup(candidates, FILES.FILE_NAMES.MANIFEST, projectFolder);
	const deploy = validateControlFileSetup(candidates, FILES.FILE_NAMES.DEPLOY, projectFolder);
	const application = validateControlFileSetup(candidates, FILES.FILE_NAMES.APPLICATION, projectFolder);

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
	return { sdfFrameworkVersion, manifest, deploy, application };
}


function discoverAllControlFileCandidates(projectFolder: string): SuiteCloudControlFile[] {
	const candidates: SuiteCloudControlFile[] = [];
	for (const entry of readdirSync(projectFolder, { withFileTypes: true })) {
		if (!entry.isFile()) {
			continue;
		}
		const filename = entry.name;
		const dot = filename.lastIndexOf(FILES.DELIMITER);
		const fileStem = filename.slice(0, dot);
		const fileExtension = filename.slice(dot + 1);
		if (dot < 0 || !CONTROL_FILE_NAME_VALUES.has(fileStem) || !CONTROL_FILE_FORMAT_VALUES.has(fileExtension)) {
			continue;
		}

		// TODO: support application.yaml, application.yml and application.json
		//  For now only application.xml is allowed for application control file.
		if (fileStem === FILES.FILE_NAMES.APPLICATION && fileExtension !== FILES.FILE_FORMATS.XML) {
			continue;
		}

		const kind = fileStem as SuiteCloudControlFileKind;
		const format = fileExtension as FileFormat;
		candidates.push({ kind, filename, filepath: resolve(projectFolder, filename), format });
	}
	return candidates;
}

// Application is optional; manifest and deploy always return a selected file.
function validateControlFileSetup(candidates: SuiteCloudControlFile[], kind: 'application', projectFolder: string): SuiteCloudControlFile | undefined;
function validateControlFileSetup(candidates: SuiteCloudControlFile[], kind: 'manifest' | 'deploy', projectFolder: string): SuiteCloudControlFile;
function validateControlFileSetup(candidates: SuiteCloudControlFile[], kind: SuiteCloudControlFileKind, projectFolder: string): SuiteCloudControlFile | undefined {
	const matches = candidates.filter((file) => file.kind === kind);
	if (matches.length > 1) {
		throw new Error(
			translationService.getMessage(
				PROJECT_CONTROL.ERROR.DUPLICATE,
				kind,
				matches.map((file) => file.filename).join(', ')
			)
		);
	}
	const file = matches[0];
	if (!file && kind !== FILES.FILE_NAMES.APPLICATION) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.MISSING, kind, projectFolder));
	}
	return file;
}

function parseManifestMetadata(contents: string, file: SuiteCloudControlFile): ProjectManifest {
	const adapter = getControlFileAdapter(file);
	const parsedDocument = adapter.parseDocument(contents, file.filename);
	const manifestMetadata = adapter.normalizeManifest(parsedDocument, file.filename);
	if (!manifestMetadata.projectType) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.PROJECT_TYPE_MISSING, file.filename));
	}
	if (manifestMetadata.projectType !== PROJECT_TYPES.ACP && manifestMetadata.projectType !== PROJECT_TYPES.SUITEAPP) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.PROJECT_TYPE_INVALID, file.filename));
	}
	return manifestMetadata;
}
