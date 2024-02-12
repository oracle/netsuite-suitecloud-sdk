/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ActionResultUtils = require('../../../utils/ActionResultUtils');

const {
	COMMAND_IMPORTOBJECTS: { OUTPUT },
} = require('../../../services/TranslationKeys');

module.exports = class ImportObjectsOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (
			!actionResult.data ||
			!(
				(Array.isArray(actionResult.data.successfulImports) && actionResult.data.successfulImports.length) ||
				(Array.isArray(actionResult.data.failedImports) && actionResult.data.failedImports.length) ||
				(Array.isArray(actionResult.data.errorImports) && actionResult.data.errorImports.length)
			)
		) {
			ActionResultUtils.logResultMessage(actionResult, this._log);
			return actionResult;
		}

		this._logImportedObjects(actionResult.data.successfulImports);
		this._logUnImportedObjects(actionResult.data.failedImports);
		this._logErrorImportedObjects(actionResult.data.errorImports);
		return actionResult;
	}

	_logImportedObjects(importedObjects) {
		if (Array.isArray(importedObjects) && importedObjects.length) {
			this._log.result(NodeTranslationService.getMessage(OUTPUT.IMPORTED_OBJECTS));
			importedObjects.forEach((objectImport) => {
				const importedObjectLogMessage = `${this._log.getPadding(1)}- ${objectImport.customObject.type}:${objectImport.customObject.id}`;
				this._log.result(importedObjectLogMessage);
				this._logReferencedFileImportResult(objectImport.referencedFileImportResult);
			});
		}
	}

	_logErrorImportedObjects(errorImports) {
		const reasons = errorImports
			.map((errorImport) => errorImport.reason)
			.reduce((totalReasons, reason) => {
				return totalReasons.includes(reason) ? totalReasons : totalReasons.concat(reason);
			}, []);
		reasons.forEach((reason) => {
			this._log.error(NodeTranslationService.getMessage(OUTPUT.OBJECT_ERROR, reason));
			errorImports
				.filter((errorImport) => errorImport.reason === reason)
				.forEach((errorImport) => {
					errorImport.scriptIds.forEach((scriptId) => {
						this._log.error(`${this._log.getPadding(1)}- ${scriptId}`);
					});
				});
		});
	}

	_logReferencedFileImportResult(referencedFileImportResult) {
		const importedFiles = referencedFileImportResult.successfulImports;
		const unImportedFiles = referencedFileImportResult.failedImports;

		const thereAreReferencedFiles =
			(Array.isArray(importedFiles) && importedFiles.length) || (Array.isArray(unImportedFiles) && unImportedFiles.length);
		if (thereAreReferencedFiles) {
			const referencedFilesLogMessage = `${this._log.getPadding(2)}- ${NodeTranslationService.getMessage(OUTPUT.REFERENCED_SUITESCRIPT_FILES)}`;
			this._log.result(referencedFilesLogMessage);
		}

		if (Array.isArray(importedFiles) && importedFiles.length) {
			importedFiles.forEach((importedFile) => {
				const importedFileLogMessage = `${this._log.getPadding(3)}- ${NodeTranslationService.getMessage(
					OUTPUT.REFERENCED_SUITESCRIPT_FILE_IMPORTED,
					importedFile.path
				)}`;
				this._log.result(importedFileLogMessage);
			});
		}

		if (Array.isArray(unImportedFiles) && unImportedFiles.length) {
			unImportedFiles.forEach((unImportedFile) => {
				const unimportedFileLogMessage = `${this._log.getPadding(3)}- ${NodeTranslationService.getMessage(
					OUTPUT.REFERENCED_SUITESCRIPT_FILE_IMPORT_FAILED,
					unImportedFile.path,
					unImportedFile.message
				)}`;
				this._log.warning(unimportedFileLogMessage);
			});
		}
	}

	_logUnImportedObjects(unImportedObjects) {
		if (Array.isArray(unImportedObjects) && unImportedObjects.length) {
			this._log.warning(NodeTranslationService.getMessage(OUTPUT.UNIMPORTED_OBJECTS));
			unImportedObjects.forEach((objectImport) => {
				const unimportedObjectLogMessage = `${this._log.getPadding(1)}- ${NodeTranslationService.getMessage(
					OUTPUT.OBJECT_IMPORT_FAILED,
					objectImport.customObject.type,
					objectImport.customObject.id,
					objectImport.customObject.result.message
				)}`;
				this._log.warning(unimportedObjectLogMessage);
			});
		}
	}
};
