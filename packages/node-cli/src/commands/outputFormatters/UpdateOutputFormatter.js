/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');

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
		const updatedObjects = actionResult.data.filter(element => element.type === UPDATED_OBJECT_TYPE.SUCCESS);
		const noUpdatedObjects = actionResult.data.filter(element => element.type !== UPDATED_OBJECT_TYPE.SUCCESS);
		const sortByKey = (a, b) => (a.key > b.key ? 1 : -1);

		if (updatedObjects.length > 0) {
			this.consoleLogger.result(NodeTranslationService.getMessage(OUTPUT.UPDATED_OBJECTS));
			updatedObjects.sort(sortByKey).forEach(updatedObject => this.consoleLogger.result(updatedObject.key));
		}
		if (noUpdatedObjects.length > 0) {
			this.consoleLogger.warning(NodeTranslationService.getMessage(OUTPUT.NO_UPDATED_OBJECTS));
			noUpdatedObjects.sort(sortByKey).forEach(noUpdatedObject => this.consoleLogger.warning(noUpdatedObject.message));
		}
	}
}

module.exports = UpdateOutputFormatter;
