/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ApplicationConstants = require('../ApplicationConstants');
const NodeTranslationService = require('../services/NodeTranslationService');

const VALIDATION_RESULT_FAILURE = validationError => ({
	result: false,
	validationMessage: validationError,
});
const VALIDATION_RESULT_SUCCESS = { result: true };

const { ANSWERS_VALIDATION_MESSAGES, COMMAND_OPTION_IS_MANDATORY } = require('../services/TranslationKeys');

const ALPHANUMERIC_LOWERCASE_REGEX = '[a-z0-9]+';
const ALPHANUMERIC_LOWERCASE_WHOLE_REGEX = `^${ALPHANUMERIC_LOWERCASE_REGEX}$`;
const ALPHANUMERIC_HYPHEN_UNDERSCORE = /^[a-zA-Z0-9-_]+$/;
const ALPHANUMERIC_HYPHEN_UNDERSCORE_EXTENDED = /^[a-zA-Z0-9-_ ]+([.]*[a-zA-Z0-9-_ ]+)*$/;
const SCRIPT_ID_REGEX = /^[a-z0-9_]+$/;
const STRING_WITH_SPACES_REGEX = /\s/;
const XML_FORBIDDEN_CHARACTERS_REGEX = /[<>&'"]/;

const PROJECT_VERSION_FORMAT_REGEX = '^\\d+(\\.\\d+){2}$';
const SUITEAPP_ID_FORMAT_REGEX = '^' + ALPHANUMERIC_LOWERCASE_REGEX + '(\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '){2}$';
const SUITEAPP_PUBLISHER_ID_FORMAT_REGEX = '^' + ALPHANUMERIC_LOWERCASE_REGEX + '\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '$';

class InteractiveAnswersValidator {
	showValidationResults(value, ...funcs) {
		for (const func of funcs) {
			const validationOutput = func(value);
			if (!validationOutput.result) {
				return validationOutput.validationMessage;
			}
		}
		return true;
	}

	validateFieldIsNotEmpty(fieldValue) {
		return fieldValue !== ''
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.EMPTY_FIELD));
	}

	validateAlphanumericHyphenUnderscoreExtended(fieldValue) {
		return ALPHANUMERIC_HYPHEN_UNDERSCORE_EXTENDED.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.ALPHANUMERIC_HYPHEN_UNDERSCORE_EXTENDED));
	}

	validateFieldHasNoSpaces(fieldValue) {
		return !STRING_WITH_SPACES_REGEX.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FIELD_HAS_SPACES));
	}

	validateFieldIsLowerCase(fieldOptionId, fieldValue) {
		return fieldValue.match(ALPHANUMERIC_LOWERCASE_WHOLE_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FIELD_NOT_LOWER_CASE, fieldOptionId));
	}

	validatePublisherId(fieldValue) {
		return fieldValue.match(SUITEAPP_PUBLISHER_ID_FORMAT_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.PUBLISHER_ID_FORMAT));
	}

	validateProjectVersion(fieldValue) {
		return fieldValue.match(PROJECT_VERSION_FORMAT_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.PROJECT_VERSION_FORMAT));
	}

	validateArrayIsNotEmpty(array) {
		return array.length > 0
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.CHOOSE_OPTION));
	}

	validateSuiteApp(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? VALIDATION_RESULT_SUCCESS
				: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.EMPTY_FIELD));

		if (notEmpty.result !== true) {
			return notEmpty;
		} else if (!fieldValue.match(SUITEAPP_ID_FORMAT_REGEX)) {
			return VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.APP_ID_FORMAT));
		}
		return VALIDATION_RESULT_SUCCESS;
	}

	validateScriptId(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? VALIDATION_RESULT_SUCCESS
				: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.EMPTY_FIELD));

		if (notEmpty.result !== true) {
			return notEmpty;
		} else if (!fieldValue.match(SCRIPT_ID_REGEX)) {
			return VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.SCRIPT_ID_FORMAT));
		}
		return VALIDATION_RESULT_SUCCESS;
	}

	validateXMLCharacters(fieldValue) {
		return !XML_FORBIDDEN_CHARACTERS_REGEX.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FIELD_HAS_XML_FORBIDDEN_CHARACTERS));
	}

	validateNotUndefined(value, optionName) {
		return value !== undefined
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(COMMAND_OPTION_IS_MANDATORY, optionName));
	}

	validateProjectType(value) {
		return [ApplicationConstants.PROJECT_SUITEAPP, ApplicationConstants.PROJECT_ACP].includes(value)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.WRONG_PROJECT_TYPE));
	}

	validateAuthIDNotInList(newAuthID, authIDs) {
		return !authIDs.includes(newAuthID)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.AUTH_ID_ALREADY_USED));
	}

	validateAlphanumericHyphenUnderscore(fieldValue) {
		return ALPHANUMERIC_HYPHEN_UNDERSCORE.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.ALPHANUMERIC_HYPHEN_UNDERSCORE));
	}

	validateMaximumLength(fieldValue, maxLength = 40) {
		return fieldValue.length <= maxLength
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.MAX_LENGTH, maxLength));
	}
}

module.exports = new InteractiveAnswersValidator();
