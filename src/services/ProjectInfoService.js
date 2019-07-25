/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ERRORS } = require('./TranslationKeys');
const {
	PROJECT_SUITEAPP,
	PROJECT_ACP,
	FILE_NAMES,
	FOLDER_NAMES,
} = require('../ApplicationConstants');
const CLIException = require('../CLIException');
const FileUtils = require('../utils/FileUtils');
const path = require('path');
const TranslationService = require('./TranslationService');
const xml2js = require('xml2js');
const assert = require('assert');

const MANIFEST_TAG_XML_PATH = '/manifest';
const PROJECT_TYPE_ATTRIBUTE = 'projecttype';
const MANIFEST_TAG_REGEX = '<manifest.*>[^]*</manifest>$';


let CACHED_PROJECT_TYPE;

module.exports = class ProjectInfoService {
	constructor(projectFolder) {
		assert(projectFolder);
		this._projectFolder = projectFolder;
	}

	/**
	 * This validation function has to be defined in xml2js.Parser in the "validator" option
	 * When calling parserString this function will be executed for every tag of the xml we are
	 * parsing.
	 * @param {string} xmlPath Path of the tag that it's being evaluated at the current moment.
	 * @param {Object} previousValue Existing value at this path if there is already one (e.g. this
	 * 								  is the second or later item in an array).
	 * @param {Object} newValue Value of the tag that it's being evaluated at the current moment.
	 * @throws ValidationError if the validation fails
	 */
	_validateXml(xmlPath, previousValue, newValue) {
		//TODO Add more cases
		if (xmlPath === MANIFEST_TAG_XML_PATH) {
			let manifestTagAttributes = newValue['$'];
			if (!manifestTagAttributes || !manifestTagAttributes[PROJECT_TYPE_ATTRIBUTE]) {
				throw new xml2js.ValidationError(
					TranslationService.getMessage(ERRORS.XML_PROJECTTYPE_ATTRIBUTE_MISSING)
				);
			} else if (
				manifestTagAttributes[PROJECT_TYPE_ATTRIBUTE] !== PROJECT_SUITEAPP &&
				manifestTagAttributes[PROJECT_TYPE_ATTRIBUTE] !== PROJECT_ACP
			) {
				throw new xml2js.ValidationError(
					TranslationService.getMessage(ERRORS.XML_PROJECTTYPE_INCORRECT)
				);
			}
		}
		return newValue;
	}

	getProjectType() {
		if (CACHED_PROJECT_TYPE) {
			return CACHED_PROJECT_TYPE;
		}

		const manifestPath = path.join(this._projectFolder, FILE_NAMES.MANIFEST_XML);

		if (!FileUtils.exists(manifestPath)) {
			const errorMessage =
				TranslationService.getMessage(ERRORS.PROCESS_FAILED) +
				' ' +
				TranslationService.getMessage(ERRORS.FILE_NOT_EXIST, manifestPath);
			throw new CLIException(-10, errorMessage);
		}

		const manifestString = FileUtils.readAsString(manifestPath);

		if (!manifestString.match(MANIFEST_TAG_REGEX)) {
			const errorMessage =
				TranslationService.getMessage(ERRORS.PROCESS_FAILED) +
				' ' +
				TranslationService.getMessage(ERRORS.XML_MANIFEST_TAG_MISSING);
			throw new CLIException(-10, errorMessage);
		}
		let projectType;
		let validationError;

		let parser = new xml2js.Parser({ validator: this._validateXml });

		parser.parseString(manifestString, function(err, result) {
			if (err) {
				const errorMessage =
					TranslationService.getMessage(ERRORS.PROCESS_FAILED) +
					' ' +
					TranslationService.getMessage(ERRORS.FILE, manifestPath);
				validationError = errorMessage + ' ' + err;
			}

			if (result) {
				projectType = result.manifest.$.projecttype;
			}
		});

		//TODO CHECK XML IS VALID

		if (validationError) {
			throw new CLIException(-10, validationError);
		}

		CACHED_PROJECT_TYPE = projectType;
		return CACHED_PROJECT_TYPE;
	}

	hasLockOrHideFiles() {
		const pathToInstallationPreferences = path.join(
			this._projectFolder,
			FOLDER_NAMES.INSTALLATION_PREFERENCES
		);
		return (
			FileUtils.exists(
				path.join(pathToInstallationPreferences, FILE_NAMES.HIDING_PREFERENCE)
			) ||
			FileUtils.exists(
				path.join(pathToInstallationPreferences, FILE_NAMES.LOCKING_PREFERENCE)
			)
		);
	}
};
