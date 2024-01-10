/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const CLIException = require('../CLIException');
const { COMMAND_OPTIONS } = require('../services/TranslationKeys');
const ValidationErrorsFormatter = require('../utils/ValidationErrorsFormatter');

function unwrapExceptionMessage(exception) {
	return exception.getErrorMessage ? exception.getErrorMessage() : exception;
}

function unwrapInformationMessage(exception) {
	return exception.getInfoMessage ? exception.getInfoMessage() : '';
}

function throwValidationException(errorMessages, runInInteractiveMode, commandMetadata) {
	const formattedError = ValidationErrorsFormatter.formatErrors(errorMessages);
	if (!runInInteractiveMode && commandMetadata.supportsInteractiveMode) {
		const suggestedCommandMessage = NodeTranslationService.getMessage(
			COMMAND_OPTIONS.VALIDATION_ERRORS_INTERACTIVE_SUGGESTION,
			commandMetadata.name
		);
		throw new CLIException(formattedError, suggestedCommandMessage);
	}

	throw new CLIException(formattedError);
}

module.exports = { unwrapExceptionMessage, unwrapInformationMessage, throwValidationException };
