/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const FileCabinetService = require('../../../services/FileCabinetService');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { FILE_CABINET } = require('../../../ApplicationConstants').FOLDERS;
const path = require('path');

const {
	COMMAND_UPLOADFILES: { OUTPUT },
} = require('../../../services/TranslationKeys');

const UPLOAD_FILE_RESULT_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
};

module.exports = class UploadFilesOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		const { data } = actionResult;

		if (Array.isArray(data)) {
			const successfulUploads = data.filter((result) => result.type === UPLOAD_FILE_RESULT_STATUS.SUCCESS);
			const unsuccessfulUploads = data.filter((result) => result.type === UPLOAD_FILE_RESULT_STATUS.ERROR);
			const localFileCabinetFolder = path.join(actionResult.projectFolder, FILE_CABINET);
			this._fileCabinetService = new FileCabinetService(localFileCabinetFolder);
			if (successfulUploads && successfulUploads.length) {
				this._log.result(NodeTranslationService.getMessage(OUTPUT.FILES_UPLOADED));
				successfulUploads.forEach((result) => {
					this._log.result(this._fileCabinetService.getFileCabinetRelativePath(result.file.path));
				});
			}
			if (unsuccessfulUploads && unsuccessfulUploads.length) {
				this._log.warning(NodeTranslationService.getMessage(OUTPUT.FILES_NOT_UPLOADED));
				unsuccessfulUploads.forEach((result) => {
					this._log.warning(`${this._fileCabinetService.getFileCabinetRelativePath(result.file.path)}: ${result.errorMessage}`);
				});
			}
		}
		return actionResult;
	}
};
