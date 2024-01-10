/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const ApplicationConstants = require('../ApplicationConstants');
const FileSystemService = require('../services/FileSystemService');
const NodeTranslationService = require('../services/NodeTranslationService');

const VALIDATION_RESULT_FAILURE = (validationError) => ({
	result: false,
	validationMessage: validationError,
});
const VALIDATION_RESULT_SUCCESS = { result: true };

const { ANSWERS_VALIDATION_MESSAGES, COMMAND_OPTIONS } = require('../services/TranslationKeys');

const ALPHANUMERIC_LOWERCASE_REGEX = '[a-z0-9]+';
const ALPHANUMERIC_LOWERCASE_WHOLE_REGEX = `^${ALPHANUMERIC_LOWERCASE_REGEX}$`;
const ALPHANUMERIC_HYPHEN_UNDERSCORE = /^[a-zA-Z0-9-_]+$/;
const ALPHANUMERIC_HYPHEN_UNDERSCORE_EXTENDED = /^[a-zA-Z0-9-_ ]+([.]*[a-zA-Z0-9-_ ]+)*$/;
const SCRIPT_ID_REGEX = /^[a-z0-9_]+$/;
const STRING_WITH_SPACES_REGEX = /\s/;
const XML_FORBIDDEN_CHARACTERS_REGEX = /[<>&'"]/;
const FILENAME_FORBIDDEN_CHARACTERS_REGEX = /[\\/:*?"<>|]/;
const DOT_AT_THE_END_OF_A_STRING_REGEX = /^.*\.$/;
const PROJECT_VERSION_FORMAT_REGEX = '^\\d+(\\.\\d+){2}$';
const SUITEAPP_ID_FORMAT_REGEX = '^' + ALPHANUMERIC_LOWERCASE_REGEX + '(\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '){2}$';
const SUITEAPP_PUBLISHER_ID_FORMAT_REGEX = '^' + ALPHANUMERIC_LOWERCASE_REGEX + '\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '$';

const FILE_EXTENSION_JS = '.js';

module.exports = {
	showValidationResults(value, ...funcs) {
		for (const func of funcs) {
			const validationOutput = func(value);
			if (!validationOutput.result) {
				return validationOutput.validationMessage;
			}
		}
		return true;
	},

	validateFieldIsNotEmpty(fieldValue) {
		return fieldValue !== ''
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.EMPTY_FIELD));
	},

	validateAlphanumericHyphenUnderscoreExtended(fieldValue) {
		return ALPHANUMERIC_HYPHEN_UNDERSCORE_EXTENDED.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.ALPHANUMERIC_HYPHEN_UNDERSCORE_EXTENDED));
	},

	validateFieldHasNoSpaces(fieldValue) {
		return !STRING_WITH_SPACES_REGEX.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FIELD_HAS_SPACES));
	},

	validateFieldIsLowerCase(fieldOptionId, fieldValue) {
		return fieldValue.match(ALPHANUMERIC_LOWERCASE_WHOLE_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FIELD_NOT_LOWER_CASE, fieldOptionId));
	},

	validatePublisherId(fieldValue) {
		return fieldValue.match(SUITEAPP_PUBLISHER_ID_FORMAT_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.PUBLISHER_ID_FORMAT));
	},

	validateProjectVersion(fieldValue) {
		return fieldValue.match(PROJECT_VERSION_FORMAT_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.PROJECT_VERSION_FORMAT));
	},

	validateArrayIsNotEmpty(array) {
		return array.length > 0
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.CHOOSE_OPTION));
	},

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
	},

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
	},

	validateXMLCharacters(fieldValue) {
		return !XML_FORBIDDEN_CHARACTERS_REGEX.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FIELD_HAS_XML_FORBIDDEN_CHARACTERS));
	},

	validateNotUndefined(value, optionName) {
		return value !== undefined
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(COMMAND_OPTIONS.IS_MANDATORY, optionName));
	},

	validateProjectType(value) {
		return [ApplicationConstants.PROJECT_SUITEAPP, ApplicationConstants.PROJECT_ACP].includes(value)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.WRONG_PROJECT_TYPE));
	},

	validateSameAuthID(newAuthID, authID) {
		return authID != newAuthID
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.CURRENT_AUTHID, newAuthID));
	},

	validateAuthIDNotInList(newAuthID, authIDsList) {
		return !authIDsList.includes(newAuthID)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.AUTH_ID_ALREADY_USED));
	},

	validateAlphanumericHyphenUnderscore(fieldValue) {
		return ALPHANUMERIC_HYPHEN_UNDERSCORE.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.ALPHANUMERIC_HYPHEN_UNDERSCORE));
	},

	validateMaximumLength(fieldValue, maxLength = 40) {
		return fieldValue.length <= maxLength
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.MAX_LENGTH, maxLength));
	},

	validateNonProductionDomain(fieldValue) {
		return !fieldValue.match(ApplicationConstants.DOMAIN.PRODUCTION.PRODUCTION_DOMAIN_REGEX) ||
			fieldValue.match(ApplicationConstants.DOMAIN.NON_PRODUCTION.F_DOMAIN_REGEX) ||
			fieldValue.match(ApplicationConstants.DOMAIN.NON_PRODUCTION.SNAP_DOMAIN_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.PRODUCTION_DOMAIN));
	},

	validateNonProductionAccountSpecificDomain(fieldValue) {
		return !fieldValue.match(ApplicationConstants.DOMAIN.PRODUCTION.PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX) ||
			fieldValue.match(ApplicationConstants.DOMAIN.NON_PRODUCTION.F_ACCOUNT_SPECIFIC_DOMAIN_REGEX) ||
			fieldValue.match(ApplicationConstants.DOMAIN.NON_PRODUCTION.SNAP_ACCOUNT_SPECIFIC_DOMAIN_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.PRODUCTION_DOMAIN));
	},

	validateSuiteScriptFileDoesNotExist(parentFolderPath, filename) {
		const filenameParts = path.parse(filename);
		const filenameExtension = filenameParts.ext;
		let filenameWithExtension = filename;
		if (!filenameExtension) {
			filenameWithExtension = filenameWithExtension + FILE_EXTENSION_JS;
		}

		const fileSystemService = new FileSystemService();
		return !fileSystemService.fileExists(path.join(parentFolderPath, filenameWithExtension))
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FILE_ALREADY_EXISTS));
	},

	validateFolderDoesNotExist(path) {
		const fileSystemService = new FileSystemService();

		return !fileSystemService.folderExists(path)
			? VALIDATION_RESULT_SUCCESS
			: NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FOLDER_ALREADY_EXISTS, path);
	},

	validateFileName(filename) {
		if (FILENAME_FORBIDDEN_CHARACTERS_REGEX.test(filename)) {
			return VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FILENAME_CONTAINS_FORBIDDEN_CHARACTERS));
		}

		return DOT_AT_THE_END_OF_A_STRING_REGEX.test(filename)
			? VALIDATION_RESULT_FAILURE(NodeTranslationService.getMessage(ANSWERS_VALIDATION_MESSAGES.FILENAME_ENDS_WITH_PERIOD))
			: VALIDATION_RESULT_SUCCESS;
	},
};
