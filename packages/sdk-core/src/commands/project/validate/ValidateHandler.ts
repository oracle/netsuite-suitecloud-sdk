/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Java source of truth:
// - cli/.../handler/ValidateHandler.java
export const VALIDATE_COMMAND = {
	OPTIONS: {
		APPLY_INSTALLATION_PREFERENCES: 'applyinstallprefs',
	},
} as const;

type ValidateExecutionParams = {
	applyinstallprefs?: boolean;
	server?: boolean;
	[key: string]: unknown;
};

type ValidateExecutionPlan = {
	params: ValidateExecutionParams;
	flags: string[];
	isServerValidation: boolean;
	installationPreferencesApplied: boolean;
};

export function prepareValidateExecution(params: ValidateExecutionParams): ValidateExecutionPlan {
	const normalizedParams = { ...params };
	const flags: string[] = [];
	let installationPreferencesApplied = false;
	delete normalizedParams.server;

	if (normalizedParams[VALIDATE_COMMAND.OPTIONS.APPLY_INSTALLATION_PREFERENCES]) {
		flags.push(VALIDATE_COMMAND.OPTIONS.APPLY_INSTALLATION_PREFERENCES);
		installationPreferencesApplied = true;
		delete normalizedParams[VALIDATE_COMMAND.OPTIONS.APPLY_INSTALLATION_PREFERENCES];
	}

	return {
		params: normalizedParams,
		flags,
		isServerValidation: true,
		installationPreferencesApplied,
	};
}
