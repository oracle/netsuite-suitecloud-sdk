/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Java source of truth:
// - cli/.../handler/DeployHandler.java
// - cli/.../handler/PreviewHandler.java
const PREVIEW_COMMAND = 'preview';

export const DEPLOY_MODE = {
	DEPLOY: 'deploy',
	PREVIEW: 'preview',
} as const;

export const DEPLOY_COMMAND = {
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		PREVIEW: 'dryrun',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
		APPLY_INSTALLATION_PREFERENCES: 'applyinstallprefs',
	},
} as const;

export const DEPLOY_VALIDATION_ERROR = {
	VALIDATE_AND_DRYRUN_OPTIONS_PASSED: 'VALIDATE_AND_DRYRUN_OPTIONS_PASSED',
} as const;

type DeployExecutionParams = {
	no_preview?: boolean;
	dryrun?: boolean;
	skip_warning?: boolean;
	validate?: boolean;
	applyinstallprefs?: boolean;
	[key: string]: unknown;
};

type DeployValidationError = {
	errorCode: typeof DEPLOY_VALIDATION_ERROR[keyof typeof DEPLOY_VALIDATION_ERROR];
};

type DeployExecutionPlan = {
	mode: typeof DEPLOY_MODE[keyof typeof DEPLOY_MODE];
	params: DeployExecutionParams;
	flags: string[];
	validationError?: DeployValidationError;
};

export function getPreviewCommandName(): string {
	return PREVIEW_COMMAND;
}

export function prepareDeployExecution(params: DeployExecutionParams): DeployExecutionPlan {
	const normalizedParams: DeployExecutionParams = { ...params };
	let flags = [DEPLOY_COMMAND.FLAGS.NO_PREVIEW, DEPLOY_COMMAND.FLAGS.SKIP_WARNING];

	if (normalizedParams[DEPLOY_COMMAND.FLAGS.VALIDATE]) {
		delete normalizedParams[DEPLOY_COMMAND.FLAGS.VALIDATE];
		flags.push(DEPLOY_COMMAND.FLAGS.VALIDATE);
	}

	if (normalizedParams[DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES]) {
		delete normalizedParams[DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES];
		flags.push(DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES);
	}

	if (normalizedParams[DEPLOY_COMMAND.FLAGS.PREVIEW]) {
		delete normalizedParams[DEPLOY_COMMAND.FLAGS.PREVIEW];
		flags = flags.filter(
			(flag) => flag !== DEPLOY_COMMAND.FLAGS.NO_PREVIEW && flag !== DEPLOY_COMMAND.FLAGS.SKIP_WARNING
		);

		if (flags.includes(DEPLOY_COMMAND.FLAGS.VALIDATE)) {
			return {
				mode: DEPLOY_MODE.PREVIEW,
				params: normalizedParams,
				flags,
				validationError: {
					errorCode: DEPLOY_VALIDATION_ERROR.VALIDATE_AND_DRYRUN_OPTIONS_PASSED,
				},
			};
		}

		return {
			mode: DEPLOY_MODE.PREVIEW,
			params: normalizedParams,
			flags,
		};
	}

	return {
		mode: DEPLOY_MODE.DEPLOY,
		params: normalizedParams,
		flags,
	};
}

export function isApplyInstallationPreferencesForDeploy(
	projectType: string | undefined,
	flags: string[],
	suiteAppProjectType: string
): boolean {
	return projectType === suiteAppProjectType && flags.includes(DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES);
}
