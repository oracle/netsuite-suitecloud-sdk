/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const ProjectMetadataService = require('../services/ProjectMetadataService');
const path = require('path');
const FileUtils = require('./FileUtils');
const NodeUtils = require('./NodeUtils');
const TranslationService = require('../services/TranslationService');

const {
	SDF_PROJECT_UTILS: { MESSAGES }
} = require('../services/TranslationKeys');

const { FILE_NAMES, FOLDER_NAMES, PROJECT_SUITEAPP } = require('../ApplicationConstants');

const COMMAND_OPTIONS = {
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
};

const APPLY_CONTENT_PROTECTION_VALUES = {
	TRUE: 'T',
	FALSE: 'F',
};

class SDFProjectUtils {
	constructor() {
		this._projectMetadataService = new ProjectMetadataService();
	}

	hasLockOrHideFiles(projectFolder) {
		const pathToInstallationPreferences = path.join(
			projectFolder,
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

	showApplyContentProtectionOptionMessage(SDKParams, projectType, projectFolder) {
		if (projectType === PROJECT_SUITEAPP) {
			if (
				SDKParams[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION] ===
				APPLY_CONTENT_PROTECTION_VALUES.TRUE
			) {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.APPLYING_CONTENT_PROTECTION,
						projectFolder
					),
					NodeUtils.COLORS.INFO
				);
			} else {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.NOT_APPLYING_CONTENT_PROTECTION,
						projectFolder
					),
					NodeUtils.COLORS.INFO
				);
			}
		}
	}
}

module.exports = new SDFProjectUtils();
