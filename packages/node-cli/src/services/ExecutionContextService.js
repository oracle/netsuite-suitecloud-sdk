/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	COMMAND_SETUPACCOUNT: {
		ERRORS: {
			BROWSER_BASED_NOT_ALLOWED,
			MACHINE_TO_MACHINE_NOT_ALLOWED,
			NON_CONSISTENT_AUTH_STATE,
		},
		MESSAGES: {
			ROTATE_PASSWORD_WARNING
		},
	},

} = require('./TranslationKeys');

const NodeTranslationService = require('./NodeTranslationService');

const ExecutionMode = {
	CI: 'CI',
	AUTH_CI_SETUP: 'AUTH_CI_SETUP',
	DEV_MACHINE: 'DEV_MACHINE',
	DEV_MACHINE_FALLBACK_PASSKEY: 'DEV_MACHINE_FALLBACK_PASSKEY',
};

const validateMachineToMachineAuthIsAllowed = () => {
	let executionMode = getExecutionMode();
	if (!(executionMode === ExecutionMode.CI || executionMode === ExecutionMode.AUTH_CI_SETUP)) {
		throw NodeTranslationService.getMessage(MACHINE_TO_MACHINE_NOT_ALLOWED);
	}
};

const validateBrowserBasedAuthIsAllowed = () => {
	let executionMode = getExecutionMode();
	if (!(executionMode === ExecutionMode.DEV_MACHINE || executionMode === ExecutionMode.DEV_MACHINE_FALLBACK_PASSKEY)) {
		throw NodeTranslationService.getMessage(BROWSER_BASED_NOT_ALLOWED);
	}
};
const getBrowserBasedWarningMessages = () => {
	let executionMode = getExecutionMode();
	if (executionMode === ExecutionMode.DEV_MACHINE_FALLBACK_PASSKEY) {
		return NodeTranslationService.getMessage(ROTATE_PASSWORD_WARNING);
	}
};

const getExecutionMode = () => {
	let envFallBackPassKey = process.env.SUITECLOUD_FALLBACK_PASSKEY;
	let envCiPassKey = process.env.SUITECLOUD_CI_PASSKEY;
	let envCi = process.env.SUITECLOUD_CI;

	if (envCi && envCi !== '0') {
		//CI
		if (envCiPassKey && !envFallBackPassKey) {
			return ExecutionMode.CI;
		}
	} else {
		//Not CI
		if (envCiPassKey && !envFallBackPassKey) {
			return ExecutionMode.AUTH_CI_SETUP;
		} else if (!envCiPassKey && !envFallBackPassKey) {
			return ExecutionMode.DEV_MACHINE;
		} else if (!envCiPassKey && envFallBackPassKey) {
			return ExecutionMode.DEV_MACHINE_FALLBACK_PASSKEY;
		}
	}
	//Default is non consistent states
	throw NodeTranslationService.getMessage(NON_CONSISTENT_AUTH_STATE, getSuiteCloudEnvVariableList());
};

const getSuiteCloudEnvVariableList = () => {
	let envFallBackPassKey = process.env.SUITECLOUD_FALLBACK_PASSKEY;
	let envCiPassKey = process.env.SUITECLOUD_CI_PASSKEY;
	let envCi = process.env.SUITECLOUD_CI;

	let variables = [];
	if (envCi && envCi !== '0') {
		variables.push('SUITECLOUD_CI');
	}
	if (envCiPassKey) {
		variables.push('SUITECLOUD_CI_PASSKEY');
	}
	if (envFallBackPassKey) {
		variables.push('SUITECLOUD_FALLBACK_PASSKEY');
	}
	return variables.join(', ');
};

module.exports = { validateBrowserBasedAuthIsAllowed, validateMachineToMachineAuthIsAllowed, getBrowserBasedWarningMessages };