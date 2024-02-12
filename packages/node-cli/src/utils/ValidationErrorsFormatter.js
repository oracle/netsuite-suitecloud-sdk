/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const TRANSLATION_KEYS = require('../services/TranslationKeys');
const { lineBreak } = require('../loggers/LoggerConstants');
const assert = require('assert');

class ValidationErrorsFormatter {
	formatErrors(validationErrors) {
		assert(validationErrors);
		assert(Array.isArray(validationErrors));

		const errorMessageHeader = NodeTranslationService.getMessage(TRANSLATION_KEYS.COMMAND_OPTIONS.VALIDATION_ERRORS);
		const validationErrorsString = validationErrors.join(lineBreak);
		return `${errorMessageHeader}${lineBreak}${validationErrorsString}`;
	}
}

module.exports = new ValidationErrorsFormatter();
