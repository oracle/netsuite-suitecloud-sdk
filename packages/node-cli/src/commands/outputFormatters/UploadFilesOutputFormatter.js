/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');

const {
	COMMAND_UPLOADFILES: { OUTPUT },
} = require('../../services/TranslationKeys');

const UPLOAD_FILE_RESULT_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
};

class UploadFilesOutputFormatter extends OutputFormatter {
	constructor(consoleLogger, fileCabinetService) {
		super(consoleLogger);
		this._fileCabinetService = fileCabinetService;
	}

	formatActionResult(actionResult) {
		const { data } = actionResult;

		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		if (Array.isArray(data)) {
			const successfulUploads = data.filter(result => result.type === UPLOAD_FILE_RESULT_STATUS.SUCCESS);
			const unsuccessfulUploads = data.filter(result => result.type === UPLOAD_FILE_RESULT_STATUS.ERROR);
			if (successfulUploads && successfulUploads.length) {
				this.consoleLogger.result(NodeTranslationService.getMessage(OUTPUT.FILES_UPLOADED));
				successfulUploads.forEach(result => {
					this.consoleLogger.result(this._fileCabinetService.getFileCabinetRelativePath(result.file.path));
				});
			}
			if (unsuccessfulUploads && unsuccessfulUploads.length) {
				this.consoleLogger.warning(NodeTranslationService.getMessage(OUTPUT.FILES_NOT_UPLOADED));
				unsuccessfulUploads.forEach(result => {
					this.consoleLogger.warning(`${this._fileCabinetService.getFileCabinetRelativePath(result.file.path)}: ${result.errorMessage}`);
				});
			}
		}
	}
}

module.exports = UploadFilesOutputFormatter;
