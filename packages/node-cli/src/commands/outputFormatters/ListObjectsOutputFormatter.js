/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const { COLORS } = require('../../loggers/LoggerConstants');

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
			this.consoleLogger.println(TranslationService.getMessage(SUCCESS_OBJECTS_IMPORTED), COLORS.RESULT);
			actionResult.data.forEach(object => this.consoleLogger.println(`${object.type}:${object.scriptId}`, COLORS.RESULT));
		} else {
			this.consoleLogger.println(TranslationService.getMessage(SUCCESS_NO_OBJECTS), COLORS.RESULT);
		}
	}
}

module.exports = ListObjectsOutputFormatter;
