/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ERRORS } = require('./TranslationKeys');
const {
	PROJECT_SUITEAPP,
	PROJECT_ACP,
	FILES,
	FOLDERS,
} = require('../ApplicationConstants');
const CLIException = require('../CLIException');
const FileUtils = require('../utils/FileUtils');
const path = require('path');
const NodeTranslationService = require('./NodeTranslationService');
const xml2js = require('xml2js');
const assert = require('assert');
const { lineBreak } = require('../loggers/LoggerConstants');
const { LINKS: { INFO } } = require('../ApplicationConstants');

const MANIFEST_TAG_XML_PATH = '/manifest';
const PROJECT_TYPE_ATTRIBUTE = 'projecttype';
const MANIFEST_TAG_REGEX = '[\\s\\n]*<manifest.*>[^]*</manifest>[\\s\\n]*$';

module.exports = class ProjectInfoService {
	constructor(projectFolder) {
		assert(projectFolder);
		this._CACHED_PROJECT_TYPE = null;
		this._CACHED_PROJECT_NAME = null;
		this._CACHED_PUBLISHER_ID = null;
		this._CACHED_PROJECT_ID = null;
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
					NodeTranslationService.getMessage(ERRORS.XML_PROJECTTYPE_ATTRIBUTE_MISSING)
				);
			} else if (
				manifestTagAttributes[PROJECT_TYPE_ATTRIBUTE] !== PROJECT_SUITEAPP &&
				manifestTagAttributes[PROJECT_TYPE_ATTRIBUTE] !== PROJECT_ACP
			) {
				throw new xml2js.ValidationError(
					NodeTranslationService.getMessage(ERRORS.XML_PROJECTTYPE_INCORRECT)
				);
			}
		}
		return newValue;
	}

	getProjectType() {
		if (!this._CACHED_PROJECT_TYPE) {
			this.parseManifest();
		}

		return this._CACHED_PROJECT_TYPE;
	}

	getProjectName() {
		if (!this._CACHED_PROJECT_NAME) {
			this.parseManifest();
		}
		return this._CACHED_PROJECT_NAME;
	}

	getPublisherId() {
		if (!this._CACHED_PUBLISHER_ID) {
			this.parseManifest();
		}

		return this._CACHED_PUBLISHER_ID;
	}

	getProjectId() {
		if (!this._CACHED_PROJECT_ID) {
			this.parseManifest();
		}

		return this._CACHED_PROJECT_ID;
	}

	getApplicationId() {
		return this.getPublisherId() + "." + this.getProjectId();
	}

	parseManifest() {
		const manifestPath = this.getManifestPath();
		const manifestString = this.getManifestString(manifestPath);

		let projectName;
		let projectType;
		let publisherId;
		let projectId;
		let validationError;

		let parser = new xml2js.Parser({ validator: this._validateXml });

		parser.parseString(manifestString, function (err, result) {
			if (err) {
				const errorMessage = NodeTranslationService.getMessage(ERRORS.PROCESS_FAILED) +
					' ' +
					NodeTranslationService.getMessage(ERRORS.FILE, manifestPath);
				validationError = errorMessage + ' ' + err;
			}

			if (result) {
				projectType = result.manifest.$.projecttype;
				projectName = result.manifest.projectname;
				publisherId = result.manifest.publisherid;
				projectId = result.manifest.projectid;
			}
		});

		//TODO CHECK XML IS VALID
		if (validationError) {
			throw new CLIException(validationError);
		}
		this._CACHED_PROJECT_TYPE = projectType;
		this._CACHED_PROJECT_NAME = projectName;
		this._CACHED_PUBLISHER_ID = publisherId;
		this._CACHED_PROJECT_ID = projectId;
	}

	getManifestPath() {
		const manifestPath = path.join(this._projectFolder, FILES.MANIFEST_XML);

		if (!FileUtils.exists(manifestPath)) {
			const errorMessage = NodeTranslationService.getMessage(ERRORS.PROCESS_FAILED) +
				' ' +
				NodeTranslationService.getMessage(ERRORS.FILE_NOT_EXIST, manifestPath) +
				lineBreak +
				NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, INFO.PROJECT_STRUCTURE);

			throw new CLIException(errorMessage);
		}
		return manifestPath;
	}

	getManifestString(manifestPath) {
		const manifestString = FileUtils.readAsString(manifestPath);

		if (!manifestString.match(MANIFEST_TAG_REGEX)) {
			const errorMessage = NodeTranslationService.getMessage(ERRORS.PROCESS_FAILED) +
				' ' +
				NodeTranslationService.getMessage(ERRORS.XML_MANIFEST_TAG_MISSING);
			throw new CLIException(errorMessage);
		}
		return manifestString;
	}

	hasLockAndHideFiles() {
		const pathToInstallationPreferences = path.join(
			this._projectFolder,
			FOLDERS.INSTALLATION_PREFERENCES
		);
		return (
			FileUtils.exists(
				path.join(pathToInstallationPreferences, FILES.HIDING_PREFERENCE)
			) &&
			FileUtils.exists(
				path.join(pathToInstallationPreferences, FILES.LOCKING_PREFERENCE)
			)
		);
	}

	isAccountCustomizationProject() {
		try {
			return this.getProjectType() === PROJECT_ACP;
		} catch (error) {
			return false;
		}
	}

	isSuiteAppProject() {
		try {
			return this.getProjectType() === PROJECT_SUITEAPP;
		} catch (error) {
			return false;
		}
	}

	isSuiteCloudProject() {
		return this.isAccountCustomizationProject() || this.isSuiteAppProject();
	}

};
