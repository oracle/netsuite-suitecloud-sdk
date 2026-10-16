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
	type ProjectContext,
	type ProjectDeploy,
	type ProjectManifest,
	type ProjectManifestSkeleton,
	type SdfProjectControlFile,
	type SdfControlFileType,
} from './SuiteCloudControlFileTypes';
import { getControlFileAdapter } from './ControlFileAdapterRegistry';


const CONTROL_FILE_NAME_VALUES = new Set<string>(Object.values(FILES.CONTROL_FILES));
const CONTROL_FILE_FORMAT_VALUES = new Set<string>(Object.values(SDF_SUPPORTED_FILE_FORMATS));


/** Check discovery, syntax, normalization structure, and manifest context rules; no schema validation. */
export function checkValidProjectContext(projectFolder: string): void {
	readProjectContext(projectFolder);
}

/** Check required files, duplicates, and generation compatibility without reading file contents. */
export function checkValidControlFileSetup(projectFolder: string): void {
	readProjectControlFilesSetup(projectFolder);
}


/** Read manifest metadata independently of deploy and application contents. Must be executed in a valid project context */
export function readProjectManifest(projectFolder: string): ProjectManifest {
	const candidates = discoverControlFilesInProject(projectFolder);
	const file = selectControlFile(candidates, FILES.CONTROL_FILES.MANIFEST, projectFolder);
	const manifest = readAndNormalizeManifestFile(file);
	validateManifestContext(manifest, file);
	return manifest;
}

/** Read physical control-file locations after validating their discovery and generation. */
export function readProjectControlFilesSetup(projectFolder: string): SdfProjectControlFiles {
	const candidates = discoverControlFilesInProject(projectFolder);
	const controlFiles = {
		manifest: selectControlFile(candidates, FILES.CONTROL_FILES.MANIFEST, projectFolder),
		deploy: selectControlFile(candidates, FILES.CONTROL_FILES.DEPLOY, projectFolder),
		application: selectControlFile(candidates, FILES.CONTROL_FILES.APPLICATION, projectFolder),
	};

	// validate control file generation (all files should use either SDFv1 or SDFv2 formats)
	const files = [controlFiles.manifest, controlFiles.deploy];
	if (controlFiles.application) {
		files.push(controlFiles.application);
	}
	const isXml = controlFiles.manifest.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML;
	if (files.some((file) => (file.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML) !== isXml)) {
		throw new Error(
			translationService.getMessage(
				PROJECT_CONTROL.ERROR.MIXED_GENERATION,
				files.map((file) => file.fileName).join(', ')
			)
		);
	}

	return controlFiles;
}

/** Read selected control files and normalized manifest/deploy data using the same checks as preflight. */
export function readProjectContext(projectFolder: string): ProjectContext {
	const controlFiles = readProjectControlFilesSetup(projectFolder);
	const manifest = readAndNormalizeManifestFile(controlFiles.manifest);
	validateManifestContext(manifest, controlFiles.manifest);

	const deploy = readAndNormalizeDeployFile(controlFiles.deploy);

	// Application can only be present in SUITE_APP projects. It's contents are only validated during packaging.
	if (controlFiles.application && manifest.projectType !== SDF_PROJECT_TYPES.SUITEAPP) {
		throw new Error(translationService.getMessage(
			PROJECT_CONTROL.ERROR.APPLICATION_REQUIRES_SUITEAPP, controlFiles.application.fileName
		));
	}

	return { controlFiles, manifest, deploy };
}

function discoverControlFilesInProject(projectFolder: string): SdfProjectControlFile[] {
	const candidates: SdfProjectControlFile[] = [];
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

		const kind = fileStem as SdfControlFileType;
		const format = fileExtension as SdfSupportedFileFormat;
		candidates.push({ type: kind, fileName: filename, filePath: resolve(projectFolder, filename), fileFormat: format });
	}
	return candidates;
}

// Application is optional; manifest and deploy always return a selected file.
function selectControlFile(candidates: SdfProjectControlFile[], kind: 'application', projectFolder: string): SdfProjectControlFile | undefined;
function selectControlFile(candidates: SdfProjectControlFile[], kind: 'manifest' | 'deploy', projectFolder: string): SdfProjectControlFile;
function selectControlFile(candidates: SdfProjectControlFile[], kind: SdfControlFileType, projectFolder: string): SdfProjectControlFile | undefined {
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


function readAndNormalizeManifestFile(file: SdfProjectControlFile): ProjectManifestSkeleton {
	const fileContents = readFileSync(file.filePath, 'utf8');
	const controlFileAdapter = getControlFileAdapter(file);
	const parsedDocument = controlFileAdapter.parseDocument(fileContents, file.fileName);

	return controlFileAdapter.normalizeManifest(parsedDocument, file.fileName);
}

function readAndNormalizeDeployFile(file: SdfProjectControlFile): ProjectDeploy {
	const fileContents = readFileSync(file.filePath, 'utf8');
	const controlFileAdapter = getControlFileAdapter(file);
	const parsedDocument = controlFileAdapter.parseDocument(fileContents, file.fileName);

	return controlFileAdapter.normalizeDeploy(parsedDocument, file.fileName);
}

/** Narrow project type and framework version only; this does not validate the manifest schema. */
function validateManifestContext(manifestMetadata: ProjectManifestSkeleton, file: SdfProjectControlFile): asserts manifestMetadata is ProjectManifest {
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
}
