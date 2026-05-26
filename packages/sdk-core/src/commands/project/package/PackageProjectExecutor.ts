/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { join } from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const PACKAGE_PROJECT_OPERATION_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

type PackageProjectOperationStatus = (typeof PACKAGE_PROJECT_OPERATION_STATUS)[keyof typeof PACKAGE_PROJECT_OPERATION_STATUS];

export type PackageProjectOperationResult = {
	status: PackageProjectOperationStatus;
	data?: string;
	resultMessage?: string;
	errorMessages?: string[];
};

export type PackageProjectExecutionInput = {
	projectFolder: string;
	destinationFolder: string;
};

const MANIFEST_FILENAME = 'manifest.xml';
const ZIP_BINARY_NAME = 'zip';
const ZIP_EXCLUDES = ['.git/*', 'node_modules/*', '.DS_Store', 'build/*'] as const;
const PROJECT_TYPE_SUITEAPP = 'SUITEAPP';

export async function executePackageProject(
	input: PackageProjectExecutionInput
): Promise<PackageProjectOperationResult> {
	try {
		if (!input.projectFolder) {
			return errorResult('A project folder is required for project packaging.');
		}
		if (!input.destinationFolder) {
			return errorResult('A destination folder is required for project packaging.');
		}

		await mkdir(input.destinationFolder, { recursive: true });
		const targetZipFilePath = await getTargetZipFilePath(input.projectFolder, input.destinationFolder);
		await execFileAsync(
			ZIP_BINARY_NAME,
			['-r', '-q', targetZipFilePath, '.', '-x', ...ZIP_EXCLUDES],
			{ cwd: input.projectFolder }
		);

		return {
			status: PACKAGE_PROJECT_OPERATION_STATUS.SUCCESS,
			data: targetZipFilePath,
			resultMessage: `The ${targetZipFilePath} file has been successfully created.`,
		};
	} catch (error: unknown) {
		return errorResult(toErrorMessage(error));
	}
}

async function getTargetZipFilePath(projectFolder: string, destinationFolder: string): Promise<string> {
	const manifestData = await readManifestData(projectFolder);
	const datePart = formatDatePart(new Date());

	if (
		manifestData.projectType === PROJECT_TYPE_SUITEAPP &&
		manifestData.publisherId &&
		manifestData.projectId &&
		manifestData.projectVersion
	) {
		const fullAppId = `${manifestData.publisherId}.${manifestData.projectId}`;
		return join(destinationFolder, `${fullAppId}-${manifestData.projectVersion}-${datePart}.zip`);
	}

	const projectName = manifestData.projectName || 'suitecloud-project';
	return join(destinationFolder, `${projectName}-${datePart}.zip`);
}

async function readManifestData(projectFolder: string): Promise<{
	projectType: string;
	projectName: string;
	publisherId: string;
	projectId: string;
	projectVersion: string;
}> {
	const manifestFilePath = join(projectFolder, MANIFEST_FILENAME);
	const manifestXml = await readFile(manifestFilePath, 'utf8');

	return {
		projectType: extractManifestValue(manifestXml, /<manifest[^>]*projecttype="([^"]*)"/i),
		projectName: extractManifestValue(manifestXml, /<projectname>([^<]*)<\/projectname>/i),
		publisherId: extractManifestValue(manifestXml, /<publisherid>([^<]*)<\/publisherid>/i),
		projectId: extractManifestValue(manifestXml, /<projectid>([^<]*)<\/projectid>/i),
		projectVersion: extractManifestValue(manifestXml, /<projectversion>([^<]*)<\/projectversion>/i),
	};
}

function extractManifestValue(xml: string, regex: RegExp): string {
	const match = xml.match(regex);
	return match && match[1] ? match[1].trim() : '';
}

function formatDatePart(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function errorResult(errorMessage: string): PackageProjectOperationResult {
	return {
		status: PACKAGE_PROJECT_OPERATION_STATUS.ERROR,
		errorMessages: [errorMessage],
	};
}

function toErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}
