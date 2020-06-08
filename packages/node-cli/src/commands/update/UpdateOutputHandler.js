/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../base/BaseOutputHandler');
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

	parse(actionResult) {
		const updatedObjects = actionResult.data.filter((element) => element.type === UPDATED_OBJECT_TYPE.SUCCESS);
		const noUpdatedObjects = actionResult.data.filter((element) => element.type !== UPDATED_OBJECT_TYPE.SUCCESS);
		const sortByKey = (a, b) => (a.key > b.key ? 1 : -1);

		if (updatedObjects.length > 0) {
			this._log.result(NodeTranslationService.getMessage(OUTPUT.UPDATED_OBJECTS));
			updatedObjects.sort(sortByKey).forEach((updatedObject) => {
				this._log.result(`${this._log.getPadding(1)}- ${updatedObject.key}`);
			});
		}
		if (noUpdatedObjects.length > 0) {
			this._log.warning(NodeTranslationService.getMessage(OUTPUT.NO_UPDATED_OBJECTS));
			noUpdatedObjects.sort(sortByKey).forEach((noUpdatedObject) => {
				this._log.warning(`${this._log.getPadding(1)}- ${noUpdatedObject.key}: ${noUpdatedObject.message}`);
			});
		}
		return actionResult;
	}
};
