const {
	showValidationResults,
	validateFieldIsNotEmpty,
	validateFieldHasNoSpaces,
	validateAlphanumericHyphenUnderscore,
	validateMaximumLength,
} = require('../../../validation/InteractiveAnswersValidator');
const assert = require('assert');
const { throwValidationException } = require('../../../utils/ExceptionUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const TRANSLATION_KEYS = require('../../../services/TranslationKeys');
const {
	ACCOUNT_SETUP_CI: {
		COMMAND: {
			OPTIONS,
			MANDATORY_PARAMS_FOR_SETUP_MODE,
		},
	},
} = require('./AccountSetupCiConstants');
const { COMMAND_SETUPACCOUNTCI: { ERRORS } } = require('../../../services/TranslationKeys');

class AccountSetupCiValidation {
	constructor(commandMetadata, runInInteractiveMode) {
		this._commandMetadata = commandMetadata;
		this._runInInteractiveMode = runInInteractiveMode;
	}

	validateAuthIDFormat(authId, isSetupMode) {
		const validateResult = showValidationResults(
			authId,
			validateFieldIsNotEmpty,
			validateFieldHasNoSpaces,
			validateAlphanumericHyphenUnderscore,
			validateMaximumLength,
		);
		if (validateResult !== true) {
			throwValidationException(
				[NodeTranslationService.getMessage(TRANSLATION_KEYS.COMMAND_OPTIONS.VALIDATION_SHOW_ERROR_MESSAGE,
					isSetupMode ? OPTIONS.AUTHID : OPTIONS.SELECT, validateResult
				)],
				false,
				this._commandMetadata
			);
		}
	}

	/**
	 * There are 2 options, select mode --select <authI> and nothing else allowed.
	 * and the setup mode --authid <authI> --certificateid <certId>--privatekeypath <privatekeypath> -account <account> -domain <domain>
	 * all mandatory except domain which is optional.
	 * @param params
	 * @param isSetupMode
	 */
	validateActionParametersByMode(params, isSetupMode) {
		assert(this._commandMetadata);
		assert(this._commandMetadata.options);
		const validationErrors = isSetupMode ?
			this._validateActionParametersSetupMode(params) :
			this._validateActionParametersSelectMode(params);

		if (validationErrors.length > 0) {
			throwValidationException(validationErrors, this._runInInteractiveMode, this._commandMetadata);
		}
	}

	/**
	 * Since account:setup:ci in standard setup mode and account:setup:ci --select are handled by the same default
	 * parameter validations, all the parameters are configured as not mandatory.
	 * The validation of the mandatory parameters for account:setup:ci standard setup mode is done here.
	 * This method makes sure all the mandatory params for the standard mode are present
	 * @param params input parameters
	 * @returns empty list if the validation is correct, otherwise it returns the list of errors with the missing mandatory
	 * fields
	 * @private
	 */
	_validateActionParametersSetupMode(params) {
		return MANDATORY_PARAMS_FOR_SETUP_MODE
			.filter(mandatoryOption => !params[mandatoryOption])
			.map(missingParam => NodeTranslationService.getMessage(ERRORS.IS_MANDATORY_SETUP_MODE, missingParam));
	}

	/**
	 * Since account:setup:ci in standard setup mode and account:setup:ci --select are handled by the same default
	 * parameter validations, all the parameters are configured as not mandatory.
	 * The validation of the not allowed parameters for account:setup:ci select mode is done here.
	 * This method makes sure none the not allowed params for the setup mode is present
	 * @param params input parameters
	 * @returns empty list if the validation is correct, otherwise it returns the list of errors with the not allowed
	 * fields
	 * @private
	 */
	_validateActionParametersSelectMode(params) {
		return Object.keys(params)
			.filter(paramKey => paramKey !== OPTIONS.SELECT)
			.map(notAllowedParam => NodeTranslationService.getMessage(ERRORS.IS_NOT_ALLOWED_SELECT_MODE, notAllowedParam));
	}

}

module.exports = AccountSetupCiValidation;