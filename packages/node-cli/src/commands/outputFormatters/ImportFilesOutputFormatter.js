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
	COMMAND_IMPORTFILES: { OUTPUT },
} = require('../../services/TranslationKeys');

class ImportFilesOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		if (Array.isArray(actionResult.data.results)) {
			const successful = actionResult.data.results.filter(result => result.loaded === true);
			const unsuccessful = actionResult.data.results.filter(result => result.loaded !== true);
			if (successful.length) {
				this.consoleLogger.println(TranslationService.getMessage(OUTPUT.FILES_IMPORTED), COLORS.RESULT);
				successful.forEach(result => {
					this.consoleLogger.println(result.path, COLORS.RESULT);
				});
			}
			if (unsuccessful.length) {
				this.consoleLogger.println(TranslationService.getMessage(OUTPUT.FILES_NOT_IMPORTED), COLORS.WARNING);
				unsuccessful.forEach(result => {
					this.consoleLogger.println(`${result.path}, ${result.message}`, COLORS.WARNING);
				});
			}
		}
	}
}

module.exports = ImportFilesOutputFormatter;
