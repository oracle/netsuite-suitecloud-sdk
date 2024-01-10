/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const assert = require('assert');
const NodeTranslationService = require('../services/NodeTranslationService');
const ProjectInfoService = require('../services/ProjectInfoService');
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

function validate(args, projectFolder) {
	const projectInfoService = new ProjectInfoService(projectFolder);

	if (args.hasOwnProperty(ACCOUNT_SPECIFIC_VALUES)) {
		assert(typeof args[ACCOUNT_SPECIFIC_VALUES] === 'string', NodeTranslationService.getMessage(ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION));
		if (projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			throw NodeTranslationService.getMessage(ERRORS.APPLY_ACCOUNT_SPECIFIC_VALUES_IN_SUITEAPP);
		}
	}
}

function transformArgument(args) {
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
				throw NodeTranslationService.getMessage(ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION);
		}
	}

	return newArgs;
}

module.exports = { validate, transformArgument, ACCOUNT_SPECIFIC_VALUES_OPTIONS, ACCOUNT_SPECIFIC_VALUES };
