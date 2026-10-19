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
	type SdfProjectControlFilesMetadata,
	type ProjectContext,
	type ProjectDeploy,
	type ProjectManifest,
	type ProjectManifestSkeleton,
	type SdfControlFileMetadata,
	type SdfControlFileType,
} from './SuiteCloudControlFileTypes';
import { getControlFileAdapter } from './adapters/ControlFileAdapterRegistry';

const CONTROL_FILE_NAME_VALUES = new Set<string>(Object.values(FILES.CONTROL_FILES));
const CONTROL_FILE_FORMAT_VALUES = new Set<string>(Object.values(SDF_SUPPORTED_FILE_FORMATS));

/**
 * Validate required control files, uniqueness, and SDF generation compatibility without reading contents.
 *
 * @param projectFolder - Project root directory.
 * @throws If setup is invalid or the directory cannot be read.
 */
export function validateControlFileSetup(projectFolder: string): void {
	resolveProjectControlFiles(projectFolder);
}

/**
 * Validate control-file setup and generation, then reads the project's manifest metadata.
 * Only validates manifest metadata. Doesn't validate other control file's contents.
 *
 * @param projectFolder - Project root directory.
 * @returns Manifest metadata with a valid project type and matching framework version.
 * @throws If setup, manifest syntax, structure, or metadata is invalid, or a file operation fails.
 */
export function readProjectManifest(projectFolder: string): ProjectManifest {
	const { manifest } = resolveProjectControlFiles(projectFolder);
	return readAndValidateProjectManifest(manifest);
}


/**
 * Validate control-file setup and generation, read normalized manifest and deploy data, and validates their contents.
 * Application contents are left unread; its presence requires a SuiteApp project.
 *
 * @param projectFolder - Project root directory.
 * @returns Selected control files, validated manifest metadata, and normalized deploy data.
 * @throws If setup, content, or application eligibility checks fail, or a file operation fails.
 */
export function readProjectContext(projectFolder: string): ProjectContext {
	const controlFilesMetadata = resolveProjectControlFiles(projectFolder);
	const manifest = readAndValidateProjectManifest(controlFilesMetadata.manifest);

	const deploy = readNormalizedProjectDeploy(controlFilesMetadata.deploy);

	// Application can only be present in SUITE_APP projects. Its contents are only validated during packaging.
	if (controlFilesMetadata.application && manifest.projectType !== SDF_PROJECT_TYPES.SUITEAPP) {
		throw new Error(translationService.getMessage(
			PROJECT_CONTROL.ERROR.APPLICATION_REQUIRES_SUITEAPP, controlFilesMetadata.application.fileName
		));
	}

	return { controlFilesMetadata, manifest, deploy };
}

// Discover control files and validate their setup without reading contents.
function resolveProjectControlFiles(projectFolder: string): SdfProjectControlFilesMetadata {
	const candidates = discoverControlFiles(projectFolder);
	return selectControlFilesAndValidateSetup(candidates, projectFolder);
}

// Find supported control files directly in the project root, ignoring unrelated entries.
function discoverControlFiles(projectFolder: string): SdfControlFileMetadata[] {
	const candidates: SdfControlFileMetadata[] = [];
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

// Require unique manifest/deploy files and an optional application file, all from one SDF generation.
function selectControlFilesAndValidateSetup(candidates: SdfControlFileMetadata[], projectFolder: string): SdfProjectControlFilesMetadata {

	// Check for duplicates
	const selectedFiles: Partial<SdfProjectControlFilesMetadata> = {};
	for (const kind of Object.values(FILES.CONTROL_FILES)) {
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
		selectedFiles[kind] = matches[0];
	}

	// Check for missing mandatory files
	const { manifest, deploy, application } = selectedFiles;
	if (!manifest) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.MISSING, FILES.CONTROL_FILES.MANIFEST, projectFolder));
	}
	if (!deploy) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.MISSING, FILES.CONTROL_FILES.DEPLOY, projectFolder));
	}

	// Check for mixed setup
	const files = [manifest, deploy];
	if (application) {
		files.push(application);
	}
	
	const isXml = manifest.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML;
	if (files.some((file) => (file.fileFormat === SDF_SUPPORTED_FILE_FORMATS.XML) !== isXml)) {
		throw new Error(
			translationService.getMessage(
				PROJECT_CONTROL.ERROR.MIXED_GENERATION,
				files.map((file) => file.fileName).join(', ')
			)
		);
	}

	return { manifest, deploy, application };
}

// Read the Deploy file contents. Doesn't execute any validations aside of ensuring valid internal structure (parsing step).
function readNormalizedProjectDeploy(file: SdfControlFileMetadata): ProjectDeploy {
	const fileContents = readFileSync(file.filePath, 'utf8');
	const controlFileAdapter = getControlFileAdapter(file);
	const parsedDocument = controlFileAdapter.parseDocument(fileContents, file.fileName);

	return controlFileAdapter.normalizeDeploy(parsedDocument, file.fileName) as ProjectDeploy;
}

// Read, parse file, normalize and validate contents of manifest file. Returns Manifest file.
function readAndValidateProjectManifest(file: SdfControlFileMetadata): ProjectManifest {
	const normalizedManifest = readNormalizedManifest(file);
	return validateManifestMetadata(normalizedManifest, file);
}

// Read the manifest file contents. Doesn't execute any validations aside of ensuring valid internal structure (parsing step).
function readNormalizedManifest(file: SdfControlFileMetadata): ProjectManifestSkeleton {
	const fileContents = readFileSync(file.filePath, 'utf8');
	const controlFileAdapter = getControlFileAdapter(file);
	const parsedDocument = controlFileAdapter.parseDocument(fileContents, file.fileName);

	return controlFileAdapter.normalizeManifest(parsedDocument, file.fileName);
}

function validateManifestMetadata(manifest: ProjectManifestSkeleton, file: SdfControlFileMetadata): ProjectManifest {
	const { projectType, frameworkVersion } = manifest;

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

	return manifest as ProjectManifest;
}
