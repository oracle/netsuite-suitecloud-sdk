/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../loggers/LoggerConstants');
const disableInIntegrationMode = 'disableInIntegrationMode';

module.exports = {
	getErrorMessagesString: actionResult => {
		return actionResult.errorMessages.join(lineBreak);
	},

	logResultMessage: (actionResult, log) => {
		if (actionResult.resultMessage) {
			log.result(actionResult.resultMessage);
		}
	},
	extractNotInteractiveCommand: (commandName, commandMetadata, actionResult) => {
		const options = _generateOptionsString(commandMetadata, actionResult);
		return `${commandName} ${options}`;
	},

};

function _generateOptionsString(commandMetadata, actionResult) {
	const flagsReducer = (accumulator, key) => `${accumulator}--${key} `;
	const commandReducer = (accumulator, key) => `${accumulator} --${key} ${actionResult.commandParameters[key]}`;

	const flags = actionResult.commandFlags && actionResult.commandFlags.length > 0
		? `${actionResult.commandFlags.filter(key => _hasToBeShown(key, commandMetadata.options)).reduce(flagsReducer, '')}`.trim()
		: ' ';

	return actionResult.commandParameters
		? Object.keys(actionResult.commandParameters)
			.filter(key => _hasToBeShown(key, commandMetadata.options))
			.reduce(commandReducer, flags).trim()
		: '';
}

function _hasToBeShown(key, options) {

	return options.hasOwnProperty(key)
		&& options[key].hasOwnProperty(disableInIntegrationMode)
		&& options[key][disableInIntegrationMode] === false;
}
