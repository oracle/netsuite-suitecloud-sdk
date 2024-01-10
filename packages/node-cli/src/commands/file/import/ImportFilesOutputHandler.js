/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const {
	COMMAND_IMPORTFILES: { OUTPUT },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS_CALLED_FROM_COMPARE_FILES = 'calledfromcomparefiles';
const COMMAND_OPTIONS_CALLED_FROM_UPDATE = 'calledfromupdate';

module.exports = class ImportFilesOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (Array.isArray(actionResult.data.results)) {
			const successful = actionResult.data.results.filter((result) => result.loaded === true);
			const unsuccessful = actionResult.data.results.filter((result) => result.loaded !== true);
			if (successful.length) {
				if (actionResult.commandParameters[COMMAND_OPTIONS_CALLED_FROM_COMPARE_FILES]) {
					return actionResult;
				}
				if (actionResult.commandParameters[COMMAND_OPTIONS_CALLED_FROM_UPDATE]) {
					this._log.result(NodeTranslationService.getMessage(OUTPUT.FILE_UPDATED));
				} else {
					this._log.result(NodeTranslationService.getMessage(OUTPUT.FILES_IMPORTED));
				}
				successful.forEach((result) => {
					this._log.result(result.path);
				});
			}
			if (unsuccessful.length) {
				if (actionResult.commandParameters[COMMAND_OPTIONS_CALLED_FROM_COMPARE_FILES]) {
					this._log.warning(NodeTranslationService.getMessage(OUTPUT.FILES_NOT_COMPARED));
				} else if (actionResult.commandParameters[COMMAND_OPTIONS_CALLED_FROM_UPDATE]) {
					this._log.warning(NodeTranslationService.getMessage(OUTPUT.FILE_NOT_UPDATED));
				} else {
					this._log.warning(NodeTranslationService.getMessage(OUTPUT.FILES_NOT_IMPORTED));
				}
				unsuccessful.forEach((result) => {
					this._log.warning(`${result.path}, ${result.message}`);
				});
			}
		}
		return actionResult;
	}
};
