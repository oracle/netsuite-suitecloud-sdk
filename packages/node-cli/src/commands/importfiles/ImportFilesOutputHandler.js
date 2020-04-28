/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');
const NodeTranslationService = require('../../services/NodeTranslationService');

const {
	COMMAND_IMPORTFILES: { OUTPUT },
} = require('../../services/TranslationKeys');

module.exports = class ImportFilesOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		if (Array.isArray(actionResult.data.results)) {
			const successful = actionResult.data.results.filter(result => result.loaded === true);
			const unsuccessful = actionResult.data.results.filter(result => result.loaded !== true);
			if (successful.length) {
				this._log.result(NodeTranslationService.getMessage(OUTPUT.FILES_IMPORTED));
				successful.forEach(result => {
					this._log.result(result.path);
				});
			}
			if (unsuccessful.length) {
				this._log.warning(NodeTranslationService.getMessage(OUTPUT.FILES_NOT_IMPORTED));
				unsuccessful.forEach(result => {
					this._log.warning(`${result.path}, ${result.message}`);
				});
			}
		}
	}
}
