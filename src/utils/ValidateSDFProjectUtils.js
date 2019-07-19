/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const TranslationService = require('../services/TranslationService');
const assert = require('assert');

const { PROJECT_ACP, PROJECT_SUITEAPP } = require('../ApplicationConstants');

const COMMAND = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		APPLY_CONTENT_PROTECTION: 'applycontentprotection',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
	},
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};
const APPLY_CONTENT_PROTECTION_VALUES = {
	FALSE: 'F',
	TRUE: 'T',
};

const {
	VALIDATE_SDF_PROJECT_UTILS: { ERRORS },
} = require('../services/TranslationKeys');

class ValidateSDFProjectUtils {
	validateAndTransformAccountSpecificValuesArgument(args) {
		const newArgs = { ...args };
		if (newArgs.hasOwnProperty(COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES)) {
			assert(
				typeof newArgs[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] === 'string',
				TranslationService.getMessage(ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION)
			);
			const upperCaseValue = newArgs[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES].toUpperCase();

			switch (upperCaseValue) {
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING:
					newArgs[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] =
						ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING;
					break;
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR:
					newArgs[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] =
						ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR;
					break;
				default:
					throw TranslationService.getMessage(
						ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION
					);
			}
		}
		return newArgs;
	}

	validateAndTransformApplyContentProtectionArgument(args, projectType) {
		const newArgs = { ...args };

		if (args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] && projectType === PROJECT_ACP) {
			throw TranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
		}

		if (projectType === PROJECT_SUITEAPP) {
			newArgs[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] = args[
				COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION
			]
				? APPLY_CONTENT_PROTECTION_VALUES.TRUE
				: APPLY_CONTENT_PROTECTION_VALUES.FALSE;
		}

		return newArgs;
	}
}

module.exports = new ValidateSDFProjectUtils();
