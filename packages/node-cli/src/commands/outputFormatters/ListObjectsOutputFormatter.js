/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');

const {
	COMMAND_LISTOBJECTS: { SUCCESS_OBJECTS_IMPORTED, SUCCESS_NO_OBJECTS },
} = require('../../services/TranslationKeys');

class ListObjectsOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
		if (Array.isArray(actionResult.data) && actionResult.data.length) {
			this.consoleLogger.result(NodeTranslationService.getMessage(SUCCESS_OBJECTS_IMPORTED));
			actionResult.data.forEach(object => this.consoleLogger.result(`${object.type}:${object.scriptId}`));
		} else {
			this.consoleLogger.result(NodeTranslationService.getMessage(SUCCESS_NO_OBJECTS));
		}
	}
}

module.exports = ListObjectsOutputFormatter;
