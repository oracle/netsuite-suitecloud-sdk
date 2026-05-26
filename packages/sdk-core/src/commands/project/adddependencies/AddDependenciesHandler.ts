/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const ADD_DEPENDENCIES_COMMAND_OPTIONS = {
	ALL: 'all',
	PROJECT: 'project',
} as const;

type AddDependenciesExecutionParams = Record<string, unknown> & {
	all?: boolean;
	project?: string;
};

export type AddDependenciesExecutionPlan = {
	params: AddDependenciesExecutionParams;
	flags: string[];
};

function normalizeArrayValue(value: unknown): string[] | undefined {
	if (Array.isArray(value)) {
		return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
	}
	if (typeof value === 'string' && value.trim().length > 0) {
		return [value];
	}
	return undefined;
}

function validateAddDependenciesInput(params: Record<string, unknown>): void {
	const hasAll = params[ADD_DEPENDENCIES_COMMAND_OPTIONS.ALL] === true;
	const features = normalizeArrayValue(params.feature);
	const files = normalizeArrayValue(params.file);
	const objects = normalizeArrayValue(params.object);
	const hasDetails = Boolean(features?.length || files?.length || objects?.length);

	if (hasAll && hasDetails) {
		throw new Error('Option "-all" cannot be combined with "-feature", "-file", or "-object".');
	}

	if (features?.length) {
		const invalidFeatures = features.filter((feature) => !/^[A-Z]+:(required|optional)$/.test(feature));
		if (invalidFeatures.length) {
			throw new Error(
				`Invalid feature dependency format: ${invalidFeatures.join(', ')}. Expected format: FEATURE:(required|optional).`
			);
		}
	}
}

function quoteString(value: string): string {
	return `"${value}"`;
}

export function prepareAddDependenciesExecution(
	params: Record<string, unknown>,
	projectFolder: string
): AddDependenciesExecutionPlan {
	const paramsWithDefaults: Record<string, unknown> = { ...params };
	const hasFeature = normalizeArrayValue(paramsWithDefaults.feature)?.length;
	const hasFile = normalizeArrayValue(paramsWithDefaults.file)?.length;
	const hasObject = normalizeArrayValue(paramsWithDefaults.object)?.length;
	const hasAll = paramsWithDefaults[ADD_DEPENDENCIES_COMMAND_OPTIONS.ALL] === true;
	if (!hasAll && !hasFeature && !hasFile && !hasObject) {
		paramsWithDefaults[ADD_DEPENDENCIES_COMMAND_OPTIONS.ALL] = true;
	}

	validateAddDependenciesInput(paramsWithDefaults);

	const normalizedParams: AddDependenciesExecutionParams = {
		...paramsWithDefaults,
		[ADD_DEPENDENCIES_COMMAND_OPTIONS.PROJECT]: quoteString(projectFolder),
	};
	const flags: string[] = [];

	if (normalizedParams[ADD_DEPENDENCIES_COMMAND_OPTIONS.ALL] === true) {
		delete normalizedParams[ADD_DEPENDENCIES_COMMAND_OPTIONS.ALL];
		flags.push(ADD_DEPENDENCIES_COMMAND_OPTIONS.ALL);
	}

	return {
		params: normalizedParams,
		flags,
	};
}
