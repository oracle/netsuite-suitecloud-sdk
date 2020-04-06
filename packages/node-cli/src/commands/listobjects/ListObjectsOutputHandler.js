/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');

const {
	COMMAND_LISTOBJECTS: { SUCCESS_OBJECTS_IMPORTED, SUCCESS_NO_OBJECTS },
} = require('../../services/TranslationKeys');

module.exports = class ListObjectsOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		ActionResultUtils.logResultMessage(actionResult, this.log);
		if (Array.isArray(actionResult.data) && actionResult.data.length) {
			this.log.result(NodeTranslationService.getMessage(SUCCESS_OBJECTS_IMPORTED));
			actionResult.data.forEach(object => this.log.result(`${object.type}:${object.scriptId}`));
		} else {
			this.log.result(NodeTranslationService.getMessage(SUCCESS_NO_OBJECTS));
		}
	}
}
