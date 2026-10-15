/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_CONTROL } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';
import {
	FILES,
	SDF_SUPPORTED_FILE_FORMATS,
	SDF_PROJECT_TYPES,
	SDF_FRAMEWORK_VERSIONS,
} from './SuiteCloudProjectConstants';
import {
	type SdfSupportedFileFormat,
	type SdfProjectControlFiles,
	type ProjectDescription,
	type ProjectDeploy,
	type ProjectManifest,
	type SuiteCloudControlFile,
	type SdfControlFileType,
} from './SuiteCloudControlFileTypes';
import { getControlFileAdapter } from './ControlFileAdapterRegistry';

const CONTROL_FILE_NAME_VALUES = new Set<string>(Object.values(FILES.CONTROL_FILES));
const CONTROL_FILE_FORMAT_VALUES = new Set<string>(Object.values(SDF_SUPPORTED_FILE_FORMATS));

// TODO: Should the methods in this class be SYNC? ASYNC? IMPLEMENT BOTH (duplicate methods)?
/** Verify and get Manifest File Content's in project folder */
export function getProjectManifestFile(projectFolder: string): ProjectManifest {
	const candidates = discoverAllControlFileCandidates(projectFolder);
	const manifest = validateControlFileSetup(candidates, FILES.CONTROL_FILES.MANIFEST, projectFolder);
	const fileContents = readFileSync(manifest.filePath, 'utf8');
	return parseManifestMetadata(fileContents, manifest);
}


/** Get Full Project Setup and Context. Finds location and contents of all control files. */
export function inspectControlFilesAndGetProjectDescription(projectFolder: string): ProjectDescription {
	const controlFiles = getProjectControlFiles(projectFolder);
	const manifestContents = readFileSync(controlFiles.manifest.filePath, 'utf8');
	const deployContents = readFileSync(controlFiles.deploy.filePath, 'utf8');

	const manifest = parseManifestMetadata(manifestContents, controlFiles.manifest);
	const deployAdapter = getControlFileAdapter(controlFiles.deploy);
	const deployDocument = deployAdapter.parseDocument(deployContents, controlFiles.deploy.fileName);
	const deploy: ProjectDeploy = deployAdapter.normalizeDeploy(deployDocument, controlFiles.deploy.fileName);
	// ignoring application control file on purpose here

	return { controlFiles, manifest, deploy };
}


/** Get list of Project control files without reading their contents. Validates for not missing, no duplicates and valid SDFv1/SDFv2 setups */
export function getProjectControlFiles(projectFolder: string): SdfProjectControlFiles {
	const candidates = discoverAllControlFileCandidates(projectFolder);
	const manifest = validateControlFileSetup(candidates, FILES.CONTROL_FILES.MANIFEST, projectFolder);
	const deploy = validateControlFileSetup(candidates, FILES.CONTROL_FILES.DEPLOY, projectFolder);
	const application = validateControlFileSetup(candidates, FILES.CONTROL_FILES.APPLICATION, projectFolder);

	if ((deploy.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML) !== (manifest.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML)) {
		throw new Error(
			translationService.getMessage(
				PROJECT_CONTROL.ERROR.MIXED_GENERATION,
				[manifest, deploy].map((file) => file.fileName).join(', ')
			)
		);
	}
	return { manifest, deploy, application };
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
		if (fileStem === FILES.CONTROL_FILES.APPLICATION && fileExtension !== SDF_SUPPORTED_FILE_FORMATS.XML) {
			continue;
		}

		const kind = fileStem as SdfControlFileType;
		const format = fileExtension as SdfSupportedFileFormat;
		candidates.push({ type: kind, fileName: filename, filePath: resolve(projectFolder, filename), fileFormat: format });
	}
	return candidates;
}

// Application is optional; manifest and deploy always return a selected file.
function validateControlFileSetup(candidates: SuiteCloudControlFile[], kind: 'application', projectFolder: string): SuiteCloudControlFile | undefined;
function validateControlFileSetup(candidates: SuiteCloudControlFile[], kind: 'manifest' | 'deploy', projectFolder: string): SuiteCloudControlFile;
function validateControlFileSetup(candidates: SuiteCloudControlFile[], kind: SdfControlFileType, projectFolder: string): SuiteCloudControlFile | undefined {
	const matches = candidates.filter((file) => file.type === kind);
	if (matches.length > 1) {
		throw new Error(
			translationService.getMessage(
				PROJECT_CONTROL.ERROR.DUPLICATE,
				kind,
				matches.map((file) => file.fileName).join(', ')
			)
		);
	}
	const file = matches[0];
	if (!file && kind !== FILES.CONTROL_FILES.APPLICATION) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.MISSING, kind, projectFolder));
	}
	return file;
}

function parseManifestMetadata(contents: string, file: SuiteCloudControlFile): ProjectManifest {
	const adapter = getControlFileAdapter(file);
	const parsedDocument = adapter.parseDocument(contents, file.fileName);
	const manifestMetadata = adapter.normalizeManifest(parsedDocument, file.fileName);
	const { projectType, frameworkVersion } = manifestMetadata;

	if (!projectType) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.PROJECT_TYPE_MISSING, file.fileName));
	}

	if (projectType !== SDF_PROJECT_TYPES.ACP && projectType !== SDF_PROJECT_TYPES.SUITEAPP) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.PROJECT_TYPE_INVALID, file.fileName));
	}

	if (!frameworkVersion) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.FRAMEWORK_VERSION_MISSING, file.fileName));
	}
	const expectedFrameworkVersion = file.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML
		? SDF_FRAMEWORK_VERSIONS.SDFv1
		: SDF_FRAMEWORK_VERSIONS.SDFv2;
	if (frameworkVersion !== expectedFrameworkVersion) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.FRAMEWORK_VERSION_MISMATCH, file.fileName, frameworkVersion));
	}

	return manifestMetadata as ProjectManifest;
}
