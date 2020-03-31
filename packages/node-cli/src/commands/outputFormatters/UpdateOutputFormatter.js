/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');
const { COLORS } = require('../../loggers/LoggerConstants');

const {
	COMMAND_UPDATE: { OUTPUT },
} = require('../../services/TranslationKeys');

const UPDATED_OBJECT_TYPE = {
	SUCCESS: 'SUCCESS',
};

class UpdateOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		const updatedObjects = actionResult.data.filter(element => element.type === UPDATED_OBJECT_TYPE.SUCCESS);
		const noUpdatedObjects = actionResult.data.filter(element => element.type !== UPDATED_OBJECT_TYPE.SUCCESS);
		const sortByKey = (a, b) => (a.key > b.key ? 1 : -1);

		if (updatedObjects.length > 0) {
			this.consoleLogger.println(TranslationService.getMessage(OUTPUT.UPDATED_OBJECTS), COLORS.RESULT);
			updatedObjects.sort(sortByKey).forEach(updatedObject => this.consoleLogger.println(updatedObject.key, COLORS.RESULT));
		}
		if (noUpdatedObjects.length > 0) {
			this.consoleLogger.println(TranslationService.getMessage(OUTPUT.NO_UPDATED_OBJECTS), COLORS.WARNING);
			noUpdatedObjects
				.sort(sortByKey)
				.forEach(noUpdatedObject => this.consoleLogger.println(noUpdatedObject.message, COLORS.WARNING));
		}
	}
}

module.exports = UpdateOutputFormatter;
