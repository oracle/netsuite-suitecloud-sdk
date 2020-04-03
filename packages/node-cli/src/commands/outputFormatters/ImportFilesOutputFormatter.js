/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');

const {
	COMMAND_IMPORTFILES: { OUTPUT },
} = require('../../services/TranslationKeys');

class ImportFilesOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (Array.isArray(actionResult.data.results)) {
			const successful = actionResult.data.results.filter(result => result.loaded === true);
			const unsuccessful = actionResult.data.results.filter(result => result.loaded !== true);
			if (successful.length) {
				this.consoleLogger.result(NodeTranslationService.getMessage(OUTPUT.FILES_IMPORTED));
				successful.forEach(result => {
					this.consoleLogger.result(result.path);
				});
			}
			if (unsuccessful.length) {
				this.consoleLogger.warning(NodeTranslationService.getMessage(OUTPUT.FILES_NOT_IMPORTED));
				unsuccessful.forEach(result => {
					this.consoleLogger.warning(`${result.path}, ${result.message}`);
				});
			}
		}
	}
}

module.exports = ImportFilesOutputFormatter;
