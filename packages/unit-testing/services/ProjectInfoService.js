/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { FILES, PROJECT_SUITEAPP } = require('../ApplicationConstants');
const FileUtils = require('../utils/FileUtils');
const UnitTestTranslationService = require('../services/UnitTestTranslationService');
const TranslationKeys = require('../services/TranslationKeys');
const TestFrameworkException = require('../TestFrameworkException');
const path = require('path');
const xml2js = require('xml2js');
const assert = require('assert');

const MANIFEST_TAG_REGEX = '[\\s\\n]*<manifest.*>[^]*</manifest>[\\s\\n]*$';

module.exports = class ProjectInfoService {
	constructor(projectFolder) {
		assert(projectFolder);
		this._projectFolder = projectFolder;
	}

	getApplicationId() {
		const manifestPath = path.join(this._projectFolder, FILES.MANIFEST_XML);

		if (!FileUtils.exists(manifestPath)) {
			const errorMessage =
				UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.PROCESS_FAILED) +
				' ' +
				UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.FILE_NOT_EXIST, manifestPath);
			throw new TestFrameworkException(-10, errorMessage);
		}

		const manifestString = FileUtils.readAsString(manifestPath);

		if (!manifestString.match(MANIFEST_TAG_REGEX)) {
			const errorMessage =
				UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.PROCESS_FAILED) +
				' ' +
				UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.XML_MANIFEST_TAG_MISSING);
			throw new TestFrameworkException(-10, errorMessage);
		}

		let applicationId;
		let validationError;
		let parser = new xml2js.Parser({ validator: this._validateXml });
		parser.parseString(manifestString, function(err, result) {
			if (err) {
				const errorMessage =
					UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.PROCESS_FAILED) +
					' ' +
					UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.FILE, manifestPath);
				validationError = errorMessage + ' ' + err;
			}

			if (result) {
				let projectType = result.manifest.$.projecttype;

				if (projectType === PROJECT_SUITEAPP) {
					applicationId = result.manifest.publisherid + '.' + result.manifest.projectid;
				} else {
					validationError = UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.ONLY_SUITEAPP_HAVE_APP_ID);
				}
			}
		});

		if (validationError) {
			throw new TestFrameworkException(-10, validationError);
		}

		return applicationId;
	}
};
