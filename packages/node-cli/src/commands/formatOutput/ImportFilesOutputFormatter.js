/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');

const {
	COMMAND_IMPORTFILES: { OUTPUT },
} = require('../../services/TranslationKeys');

class ImportFilesOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatOutput(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		if (Array.isArray(actionResult.data.results)) {
			const successful = actionResult.data.results.filter(result => result.loaded === true);
			const unsuccessful = actionResult.data.results.filter(result => result.loaded !== true);
			if (successful.length) {
				this.consoleLogger.println(TranslationService.getMessage(OUTPUT.FILES_IMPORTED), this.consoleLogger.COLORS.RESULT);
				successful.forEach(result => {
					this.consoleLogger.println(result.path, this.consoleLogger.COLORS.RESULT);
				});
			}
			if (unsuccessful.length) {
				this.consoleLogger.println(TranslationService.getMessage(OUTPUT.FILES_NOT_IMPORTED), this.consoleLogger.COLORS.WARNING);
				unsuccessful.forEach(result => {
					this.consoleLogger.println(`${result.path}, ${result.message}`, this.consoleLogger.COLORS.WARNING);
				});
			}
		}
	}
}

module.exports = ImportFilesOutputFormatter;
