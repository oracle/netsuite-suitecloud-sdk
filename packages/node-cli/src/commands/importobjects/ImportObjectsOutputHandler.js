/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');

const {
	COMMAND_IMPORTOBJECTS: { OUTPUT },
} = require('../../services/TranslationKeys');

module.exports = class ImportObjectsOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		if (!actionResult.data) {
			ActionResultUtils.logResultMessage(actionResult, this.log);
			return;
		}

		this._logImportedObjects(actionResult.data.successfulImports);
		this._logUnImportedObjects(actionResult.data.failedImports);
	}

	_logImportedObjects(importedObjects) {
		if (Array.isArray(importedObjects) && importedObjects.length) {
			this.log.result(NodeTranslationService.getMessage(OUTPUT.IMPORTED_OBJECTS));
			importedObjects.forEach(objectImport => {
				const importedObjectLogMessage = `${this.log.getPadding(1)}- ${objectImport.customObject.type}:${
					objectImport.customObject.id
				}`;
				this.log.result(importedObjectLogMessage);
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
			const referencedFilesLogMessage = `${this.log.getPadding(2)}- ${NodeTranslationService.getMessage(
				OUTPUT.REFERENCED_SUITESCRIPT_FILES
			)}`;
			this.log.result(referencedFilesLogMessage);
		}

		if (Array.isArray(importedFiles) && importedFiles.length) {
			importedFiles.forEach(importedFile => {
				const importedFileLogMessage = `${this.log.getPadding(3)}- ${NodeTranslationService.getMessage(
					OUTPUT.REFERENCED_SUITESCRIPT_FILE_IMPORTED,
					importedFile.path
				)}`;
				this.log.result(importedFileLogMessage);
			});
		}

		if (Array.isArray(unImportedFiles) && unImportedFiles.length) {
			unImportedFiles.forEach(unImportedFile => {
				const unimportedFileLogMessage = `${this.log.getPadding(3)}- ${NodeTranslationService.getMessage(
					OUTPUT.REFERENCED_SUITESCRIPT_FILE_IMPORT_FAILED,
					unImportedFile.path,
					unImportedFile.message
				)}`;
				this.log.warning(unimportedFileLogMessage);
			});
		}
	}

	_logUnImportedObjects(unImportedObjects) {
		if (Array.isArray(unImportedObjects) && unImportedObjects.length) {
			this.log.warning(NodeTranslationService.getMessage(OUTPUT.UNIMPORTED_OBJECTS));
			unImportedObjects.forEach(objectImport => {
				const unimportedObjectLogMessage = `${this.log.getPadding(1)}- ${NodeTranslationService.getMessage(
					OUTPUT.OBJECT_IMPORT_FAILED,
					objectImport.customObject.type,
					objectImport.customObject.id,
					objectImport.customObject.result.message
				)}`;
				this.log.warning(unimportedObjectLogMessage);
			});
		}
	}
}

