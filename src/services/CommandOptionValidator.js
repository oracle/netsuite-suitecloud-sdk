'use strict';
const TranslationService = require('../services/TranslationService');
const TRANSLATION_KEYS = require('../services/TranslationKeys');
const { lineBreak } = require('../utils/NodeUtils');
const assert = require('assert');

module.exports = class CommandOptionValidator {
	constructor(commandOptions) {
		assert(commandOptions);
		this._commandOptions = commandOptions;
	}

	validate(args) {
		assert(args);
		var validationErrors = [];

		var isMandatoryOptionPresent = (optionId, aliasId, args) => {
			return args[optionId] || args[aliasId];
		};

		for (const optionId in this._commandOptions) {
			const option = this._commandOptions[optionId];
			var aliasId = option.alias;
			if (this._commandOptions.hasOwnProperty(optionId)) {
				if (option.mandatory && !isMandatoryOptionPresent(optionId, aliasId, args)) {
					var mandatoryErrorMessage = TranslationService.getMessage(
						TRANSLATION_KEYS.COMMAND_OPTION_IS_MANDATORY,
						option.name
					);
					validationErrors.push(mandatoryErrorMessage);
				}
			}
		}
		return validationErrors;
	}

	formatErrors(validationErrors) {
		assert(validationErrors);
		assert(Array.isArray(validationErrors));

		var errorMessageHeader = TranslationService.getMessage(
			TRANSLATION_KEYS.COMMAND_OPTIONS_VALIDATION_ERRORS
		);
		var valiationErrorsString = validationErrors.join(lineBreak);
		return `${errorMessageHeader}${lineBreak}${valiationErrorsString}`;
	}
};
