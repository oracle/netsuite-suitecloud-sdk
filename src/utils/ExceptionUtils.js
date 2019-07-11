'use strict';

const TranslationService = require('../services/TranslationService');
const CLIException = require('../CLIException');
const { COMMAND_OPTIONS_VALIDATION_ERRORS_INTERACTIVE_SUGGESTION } = require('../services/TranslationKeys');
const ValidationErrorsFormatter = require('../utils/ValidationErrorsFormatter');

function unwrapExceptionMessage(exception){
	return exception.getErrorMessage ? exception.getErrorMessage() : exception;
}

function unwrapInformationMessage(exception) {
	return exception.getInfoMessage ? exception.getInfoMessage() : '';
}

function throwValidationException(errorMessages, runInInteractiveMode, commandMetadata) {
	const formattedError = ValidationErrorsFormatter.formatErrors(errorMessages);
	if (!runInInteractiveMode && commandMetadata.supportsInteractiveMode) {
		const suggestedCommandMessage = TranslationService.getMessage(
			COMMAND_OPTIONS_VALIDATION_ERRORS_INTERACTIVE_SUGGESTION,
			commandMetadata.name
		);
		throw new CLIException(-10, formattedError, suggestedCommandMessage);
	}

	throw new CLIException(-10, formattedError);
}

module.exports = {unwrapExceptionMessage, unwrapInformationMessage, throwValidationException};