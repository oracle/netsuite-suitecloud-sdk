/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const TranslationService = require('../services/TranslationService');
const assert = require('assert');
const {
	UTILS: {
		ACCOUNT_SPECIFIC_VALUES_ARGUMENT_HANDLER: { ERRORS },
	},
} = require('../services/TranslationKeys');
const { PROJECT_SUITEAPP } = require('../ApplicationConstants');

const ACCOUNT_SPECIFIC_VALUES = 'accountspecificvalues';
const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

module.exports = class AccountSpecificValuesArgumentHandler {
	constructor(options) {
		assert(options.projectInfoService);
		this._projectInfoService = options.projectInfoService;
	}

	validate(args) {
		if (args.hasOwnProperty(ACCOUNT_SPECIFIC_VALUES)) {
			assert(
				typeof args[ACCOUNT_SPECIFIC_VALUES] === 'string',
				TranslationService.getMessage(ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION)
			);
			if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
				throw TranslationService.getMessage(
					ERRORS.APPLY_ACCOUNT_SPECIFIC_VALUES_IN_SUITEAPP
				);
			}
		}
	}

	transformArgument(args) {
		const newArgs = {};

		if (args.hasOwnProperty(ACCOUNT_SPECIFIC_VALUES)) {
			const upperCaseValue = args[ACCOUNT_SPECIFIC_VALUES].toUpperCase();
			switch (upperCaseValue) {
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING:
					newArgs[ACCOUNT_SPECIFIC_VALUES] = ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING;
					break;
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR:
					newArgs[ACCOUNT_SPECIFIC_VALUES] = ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR;
					break;
				default:
					throw TranslationService.getMessage(
						ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION
					);
			}
		}

		return newArgs;
	}
};
