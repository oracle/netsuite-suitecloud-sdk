'use strict';
const TranslationService = require('../services/TranslationService');
const TRANSLATION_KEYS = require('../services/TranslationKeys');
const { lineBreak } = require('../utils/NodeUtils');
const assert = require('assert');

class ValidationErrorsFormatter {
	formatErrors(validationErrors) {
		assert(validationErrors);
		assert(Array.isArray(validationErrors));

		var errorMessageHeader = TranslationService.getMessage(
			TRANSLATION_KEYS.COMMAND_OPTIONS_VALIDATION_ERRORS
		);
		var validationErrorsString = validationErrors.join(lineBreak);
		return `${errorMessageHeader}${lineBreak}${validationErrorsString}`;
	}
}

module.exports = new ValidationErrorsFormatter();