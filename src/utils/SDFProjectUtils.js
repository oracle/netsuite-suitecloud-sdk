'use strict';

const ProjectMetadataService = require('../services/ProjectMetadataService');
const path = require('path');
const FileUtils = require('../utils/FileUtils');
const TranslationService = require('../services/TranslationService');
const CommandUtils = require('../utils/CommandUtils');
const assert = require('assert');

const {
	FILE_NAMES,
	FOLDER_NAMES,
	PROJECT_ACP,
	PROJECT_SUITEAPP,
} = require('../ApplicationConstants');

const {
	SDF_PROJECT_UTILS: { ERRORS },
} = require('../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		APPLY_CONTENT_PROTECTION: 'applycontentprotection',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
	},
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};
const APPLY_CONTENT_PROTECTION_VALUES = {
	FALSE: 'F',
	TRUE: 'T',
};

class SDFProjectUtils {
	constructor() {
		this._projectMetadataService = new ProjectMetadataService();
	}

	isSuiteAppProject(projectFolder) {
		return this._projectMetadataService.getProjectType(projectFolder) === PROJECT_SUITEAPP;
	}

	isACProject(projectFolder) {
		return this._projectMetadataService.getProjectType(projectFolder) === PROJECT_ACP;
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

	validateAndDeployPreExecuteAction(args, projectFolder) {
		args[COMMAND.OPTIONS.PROJECT] = CommandUtils.quoteString(projectFolder);

		if (
			args.hasOwnProperty(COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES) &&
			this.isACProject(projectFolder)
		) {
			assert(
				typeof args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] === 'string',
				TranslationService.getMessage(ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION)
			);
			const upperCaseValue = args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES].toUpperCase();

			switch (upperCaseValue) {
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING:
					args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] =
						ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING;
					break;
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR:
					args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] =
						ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR;
					break;
				default:
					throw TranslationService.getMessage(
						ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION
					);
			}
		}

		const projectType = this._projectMetadataService.getProjectType(projectFolder);

		if (args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] && projectType === PROJECT_ACP) {
			throw TranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
		}

		if (projectType === PROJECT_SUITEAPP) {
			args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] = args[
				COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION
			]
				? APPLY_CONTENT_PROTECTION_VALUES.TRUE
				: APPLY_CONTENT_PROTECTION_VALUES.FALSE;
		}

		return { ...args };
	}
}

module.exports = new SDFProjectUtils();
