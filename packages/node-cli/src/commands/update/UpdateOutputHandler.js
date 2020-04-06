/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');
const NodeTranslationService = require('../../services/NodeTranslationService');

const {
	COMMAND_UPDATE: { OUTPUT },
} = require('../../services/TranslationKeys');

const UPDATED_OBJECT_TYPE = {
	SUCCESS: 'SUCCESS',
};

module.exports = class UpdateOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		const updatedObjects = actionResult.data.filter(element => element.type === UPDATED_OBJECT_TYPE.SUCCESS);
		const noUpdatedObjects = actionResult.data.filter(element => element.type !== UPDATED_OBJECT_TYPE.SUCCESS);
		const sortByKey = (a, b) => (a.key > b.key ? 1 : -1);

		if (updatedObjects.length > 0) {
			this.log.result(NodeTranslationService.getMessage(OUTPUT.UPDATED_OBJECTS));
			updatedObjects.sort(sortByKey).forEach(updatedObject => this.log.result(updatedObject.key));
		}
		if (noUpdatedObjects.length > 0) {
			this.log.warning(NodeTranslationService.getMessage(OUTPUT.NO_UPDATED_OBJECTS));
			noUpdatedObjects.sort(sortByKey).forEach(noUpdatedObject => this.log.warning(noUpdatedObject.message));
		}
	}
}
