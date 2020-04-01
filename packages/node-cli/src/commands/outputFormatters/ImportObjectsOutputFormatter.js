/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
('use strict');
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const { COLORS } = require('../../loggers/LoggerConstants');

const {
	COMMAND_IMPORTOBJECTS: { OUTPUT },
} = require('../../services/TranslationKeys');

class ImportObjectsOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		if (!actionResult.data) {
			ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
			return;
		}

		this._logImportedObjects(actionResult.data.successfulImports);
		this._logUnImportedObjects(actionResult.data.failedImports);
	}

	_logImportedObjects(importedObjects) {
		if (Array.isArray(importedObjects) && importedObjects.length) {
			this.consoleLogger.println(NodeTranslationService.getMessage(OUTPUT.IMPORTED_OBJECTS), COLORS.RESULT);
			importedObjects.forEach(objectImport => {
				const importedObjectLogMessage = `${this.consoleLogger.getPadding(1)}- ${objectImport.customObject.type}:${
					objectImport.customObject.id
				}`;
				this.consoleLogger.println(importedObjectLogMessage, COLORS.RESULT);
				this._logReferencedFileImportResult(objectImport.referencedFileImportResult);
			});
		}
	}

	_logReferencedFileImportResult(referencedFileImportResult) {
		const importedFiles = referencedFileImportResult.successfulImports;
		const unImportedFiles = referencedFileImportResult.failedImports;

		const thereAreReferencedFiles =
			(Array.isArray(importedFiles) && importedFiles.length) || (Array.isArray(unImportedFiles) && unImportedFiles.length);
		if (thereAreReferencedFiles) {
			const referencedFilesLogMessage = `${this.consoleLogger.getPadding(2)}- ${NodeTranslationService.getMessage(
				OUTPUT.REFERENCED_SUITESCRIPT_FILES
			)}`;
			this.consoleLogger.println(referencedFilesLogMessage, COLORS.RESULT);
		}

		if (Array.isArray(importedFiles) && importedFiles.length) {
			importedFiles.forEach(importedFile => {
				const importedFileLogMessage = `${this.consoleLogger.getPadding(3)}- ${NodeTranslationService.getMessage(
					OUTPUT.REFERENCED_SUITESCRIPT_FILE_IMPORTED,
					importedFile.path
				)}`;
				this.consoleLogger.println(importedFileLogMessage, COLORS.RESULT);
			});
		}

		if (Array.isArray(unImportedFiles) && unImportedFiles.length) {
			unImportedFiles.forEach(unImportedFile => {
				const unimportedFileLogMessage = `${this.consoleLogger.getPadding(3)}- ${NodeTranslationService.getMessage(
					OUTPUT.REFERENCED_SUITESCRIPT_FILE_IMPORT_FAILED,
					unImportedFile.path,
					unImportedFile.message
				)}`;
				this.consoleLogger.println(unimportedFileLogMessage, COLORS.WARNING);
			});
		}
	}

	_logUnImportedObjects(unImportedObjects) {
		if (Array.isArray(unImportedObjects) && unImportedObjects.length) {
			this.consoleLogger.println(NodeTranslationService.getMessage(OUTPUT.UNIMPORTED_OBJECTS), COLORS.WARNING);
			unImportedObjects.forEach(objectImport => {
				const unimportedObjectLogMessage = `${this.consoleLogger.getPadding(1)}- ${NodeTranslationService.getMessage(
					OUTPUT.OBJECT_IMPORT_FAILED,
					objectImport.customObject.type,
					objectImport.customObject.id,
					objectImport.customObject.result.message
				)}`;
				this.consoleLogger.println(unimportedObjectLogMessage, COLORS.WARNING);
			});
		}
	}
}

module.exports = ImportObjectsOutputFormatter;
