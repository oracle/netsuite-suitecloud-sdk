'use strict';
const OperationResultStatus = require('../commands/OperationResultStatus');
const NodeUtils = require('./NodeUtils');
const TranslationService = require('../services/TranslationService');
const { ERRORS } = require('../services/TranslationKeys');

module.exports = {
	hasErrors: operationResult => {
		return operationResult.status === OperationResultStatus.ERROR
	},
	logErrors: operationResult => {
		const { messages } = operationResult;
		if (Array.isArray(messages) && messages.length > 0 ) {
			messages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.ERROR));
		} else {
			NodeUtils.println(
				TranslationService.getMessage(ERRORS.PROCESS_FAILED),
				NodeUtils.COLORS.ERROR
			);
		}
	},
	logMessages: operationResult => {
		const { messages } = operationResult;
		if (Array.isArray(messages)) {
			messages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.RESULT));
		}
	}
};
