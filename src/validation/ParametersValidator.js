'use strict';

const TranslationService = require('../services/TranslationService');
const CLIException = require('../CLIException');
const { COMMAND_OPTIONS_VALIDATION_ERRORS_INTERACTIVE_SUGGESTION } = require('../services/TranslationKeys');
const ValidationErrorsFormatter = require('../utils/ValidationErrorsFormatter');

class ParametersValidator {
    checkValidationErrors(errorMessages, runInInteractiveMode, commandMetadata){
        if (errorMessages.length == 0) return;

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
}

module.exports = new ParametersValidator();