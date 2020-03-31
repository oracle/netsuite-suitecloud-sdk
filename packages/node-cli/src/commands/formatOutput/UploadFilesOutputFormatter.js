/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');

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

	formatOutput(actionResult) {
		const { data } = actionResult;

		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		if (Array.isArray(data)) {
			const successfulUploads = data.filter(result => result.type === UPLOAD_FILE_RESULT_STATUS.SUCCESS);
			const unsuccessfulUploads = data.filter(result => result.type === UPLOAD_FILE_RESULT_STATUS.ERROR);
			if (successfulUploads && successfulUploads.length) {
				this.consoleLogger.println(TranslationService.getMessage(OUTPUT.FILES_UPLOADED), this.consoleLogger.COLORS.RESULT);
				successfulUploads.forEach(result => {
					this.consoleLogger.println(
						this._fileCabinetService.getFileCabinetRelativePath(result.file.path),
						this.consoleLogger.COLORS.RESULT
					);
				});
			}
			if (unsuccessfulUploads && unsuccessfulUploads.length) {
				this.consoleLogger.println(TranslationService.getMessage(OUTPUT.FILES_NOT_UPLOADED), this.consoleLogger.COLORS.WARNING);
				unsuccessfulUploads.forEach(result => {
					this.consoleLogger.println(
						`${this._fileCabinetService.getFileCabinetRelativePath(result.file.path)}: ${result.errorMessage}`,
						this.consoleLogger.COLORS.WARNING
					);
				});
			}
		}
	}
}

module.exports = UploadFilesOutputFormatter;
