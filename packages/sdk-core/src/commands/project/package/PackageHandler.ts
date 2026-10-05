/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { join } from 'node:path';
import {
	executePackageProject,
	type PackageProjectExecutionInput,
	type PackageProjectOperationResult,
} from './PackageProjectExecutor';

export const PACKAGE_COMMAND_OPTIONS = {
	PROJECT: 'project',
	DESTINATION: 'destination',
} as const;

const DEFAULT_DESTINATION_FOLDER = 'build';

type PackageParams = {
	project?: string;
	destination?: string;
	[key: string]: unknown;
};

export function preparePackageParams(
	params: PackageParams,
	executionPath: string,
	projectFolder: string,
	destinationFolder: string = DEFAULT_DESTINATION_FOLDER
): PackageParams {
	return {
		...params,
		[PACKAGE_COMMAND_OPTIONS.DESTINATION]: quoteString(join(executionPath, destinationFolder)),
		[PACKAGE_COMMAND_OPTIONS.PROJECT]: quoteString(projectFolder),
	};
}

function quoteString(value: string): string {
	return `"${value}"`;
}

export async function executePackageCommand(
	input: PackageProjectExecutionInput
): Promise<PackageProjectOperationResult> {
	return executePackageProject(input);
}
