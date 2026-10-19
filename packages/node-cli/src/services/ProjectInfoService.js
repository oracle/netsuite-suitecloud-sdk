/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const assert = require('assert');
const path = require('path');

const { ERRORS } = require('./TranslationKeys');
const {
	FILES,
	FOLDERS,
	LINKS: { INFO },
	PROJECT_ACP,
	PROJECT_SUITEAPP
} = require('../ApplicationConstants');
const CLIException = require('../CLIException');
const { toErrorMessages } = require('../utils/ErrorMessageUtils');
const FileUtils = require('../utils/FileUtils');
const NodeTranslationService = require('./NodeTranslationService');
const { lineBreak } = require('../loggers/LoggerOsConstants');
const { validateControlFileSetup, readProjectManifest, } = require('@oracle/suitecloud-sdk-core').services;

module.exports = class ProjectInfoService {
	constructor(projectFolder) {
		assert(projectFolder);
		this._projectFolder = projectFolder;
		this._manifest = null;
	}

	_getManifest() {
		if (!this._manifest) {
			try {
				this._manifest = readProjectManifest(this._projectFolder);
			} catch (error) {
				throw new CLIException(toErrorMessages(error).join(lineBreak));
			}
		}
		return this._manifest;
	}

	getProjectType() {
		return this._getManifest().projectType;
	}

	getProjectName() {
		return this._getManifest().projectName;
	}

	getPublisherId() {
		return this._getManifest().publisherId;
	}

	getProjectId() {
		return this._getManifest().projectId;
	}

	getApplicationId() {
		return this._getManifest().getApplicationId() ?? '';
	}

	hasLockAndHideFiles() {
		const pathToInstallationPreferences = path.join(
			this._projectFolder,
			FOLDERS.INSTALLATION_PREFERENCES
		);
		return (
			FileUtils.exists(path.join(pathToInstallationPreferences, FILES.HIDING_PREFERENCE_XML)) &&
			FileUtils.exists(path.join(pathToInstallationPreferences, FILES.LOCKING_PREFERENCE_XML))
		);
	}

	isAccountCustomizationProject() {
		try {
			return this.getProjectType() === PROJECT_ACP;
		} catch {
			return false;
		}
	}

	isSuiteAppProject() {
		try {
			return this.getProjectType() === PROJECT_SUITEAPP;
		} catch {
			return false;
		}
	}

	isSuiteCloudProject() {
		return this.isAccountCustomizationProject() || this.isSuiteAppProject();
	}

	checkWorkingDirectoryContainsValidProject(commandName) {
		try {
			validateControlFileSetup(this._projectFolder);
		} catch (error) {
			const guidance = NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, INFO.PROJECT_STRUCTURE);
			throw new CLIException(`${commandName}:${lineBreak}${toErrorMessages(error).join(lineBreak)}${lineBreak}${guidance}`);
		}
	}

	checkWorkingDirectoryContainsFile(commandName, fileName) {
		if (!FileUtils.exists(path.join(this._projectFolder, fileName))) {
			throw new CLIException(NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, fileName, this._projectFolder, commandName));
		}
	}
};
