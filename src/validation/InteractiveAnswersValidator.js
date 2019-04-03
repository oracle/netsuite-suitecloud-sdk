'use strict';
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const { ERRORS } = require('../services/TranslationKeys');

const FAILED_VALIDATION_RESULT_FACTORY = validationError => ({
	result: false,
	validationMessage: validationError,
});
const PASSED_VALIDATION_RESULT = { result: true };

NodeUtils.formatString(TranslationService.getMessage(ERRORS.EMPTY_FIELD), {
	color: NodeUtils.COLORS.ERROR,
	bold: true,
});

const ALPHANUMERIC_LOWERCASE_REGEX = '[a-z0-9]+';

const SUITEAPP_ID_FORMAT_REGEX =
	'^' + ALPHANUMERIC_LOWERCASE_REGEX + '(\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '){2}$';

class InteractiveAnswersValidator {
	showValidationResults(value, func) {
		const validationOutput = func(value);
		if (!validationOutput.result) {
			return NodeUtils.formatString(validationOutput.validationMessage, {
				color: NodeUtils.COLORS.ERROR,
				bold: true,
			});
		}
		return true;
	}

	validateFieldIsNotEmpty(fieldValue) {
		return fieldValue !== ''
			? PASSED_VALIDATION_RESULT
			: FAILED_VALIDATION_RESULT_FACTORY(TranslationService.getMessage(ERRORS.EMPTY_FIELD));
	}

	validateArrayIsNotEmpty(array) {
		return array.length > 0
			? PASSED_VALIDATION_RESULT
			: FAILED_VALIDATION_RESULT_FACTORY(TranslationService.getMessage(ERRORS.CHOOSE_OPTION));
	}

	validateSuiteApp(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? PASSED_VALIDATION_RESULT
				: FAILED_VALIDATION_RESULT_FACTORY(
						TranslationService.getMessage(ERRORS.EMPTY_FIELD)
				  );

		if (notEmpty.result != true) {
			return notEmpty;
		} else if (!fieldValue.match(SUITEAPP_ID_FORMAT_REGEX)) {
			return FAILED_VALIDATION_RESULT_FACTORY(
				TranslationService.getMessage(ERRORS.APPID_FORMAT)
			);
		}
		return PASSED_VALIDATION_RESULT;
	}
}

module.exports = new InteractiveAnswersValidator();
