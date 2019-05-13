'use strict';
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const { ERRORS } = require('../services/TranslationKeys');

const VALIDATION_RESULT_FAILURE = validationError => ({
	result: false,
	validationMessage: validationError,
});
const VALIDATION_RESULT_SUCCESS = { result: true };

NodeUtils.formatString(TranslationService.getMessage(ERRORS.EMPTY_FIELD), {
	color: NodeUtils.COLORS.ERROR,
	bold: true,
});

const ALPHANUMERIC_LOWERCASE_REGEX = '[a-z0-9]+';
const SCRIPT_ID_REGEX = /^[a-z0-9_]+$/;

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
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.EMPTY_FIELD));
	}

	validateArrayIsNotEmpty(array) {
		return array.length > 0
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.CHOOSE_OPTION));
	}

	validateSuiteApp(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? VALIDATION_RESULT_SUCCESS
				: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.EMPTY_FIELD));

		if (notEmpty.result != true) {
			return notEmpty;
		} else if (!fieldValue.match(SUITEAPP_ID_FORMAT_REGEX)) {
			return VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.APP_ID_FORMAT));
		}
		return VALIDATION_RESULT_SUCCESS;
	}

	validateScriptId(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? VALIDATION_RESULT_SUCCESS
				: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.EMPTY_FIELD));

		if (notEmpty.result != true) {
			return notEmpty;
		} else if (!fieldValue.match(SCRIPT_ID_REGEX)) {
			return VALIDATION_RESULT_FAILURE(
				TranslationService.getMessage(ERRORS.SCRIPT_ID_FORMAT)
			);
		}
		return VALIDATION_RESULT_SUCCESS;
	}
}

module.exports = new InteractiveAnswersValidator();
