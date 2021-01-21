/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const ProjectInfoService = require('../services/ProjectInfoService');
const { LINKS, PROJECT_ACP } = require('../ApplicationConstants');

const APPLY_CONTENT_PROTECTION = 'applycontentprotection';
const APPLY_INSTALLATION_PREFERENCES = 'applyinstallprefs';

const {
	UTILS: {
		APPLY_CONTENT_PROTECTION_ARGUMENT_HANDLER: { ERRORS, WARNINGS },
		APPLY_INSTALLATION_PREFERENCES_ARGUMENT_HANDLER: { INSTALLATION_PREFERENCES_ERRORS },
	},
} = require('../services/TranslationKeys');

function validate(args, projectFolder, commandName, logger) {
	const projectInfoService = new ProjectInfoService(projectFolder);

	if (args[APPLY_CONTENT_PROTECTION]) {
		logger.warning(NodeTranslationService.getMessage(WARNINGS.APPLY_CONTENT_PROTECTION_IS_DEPRECATED));
	}

	if (args[APPLY_CONTENT_PROTECTION] && args[APPLY_INSTALLATION_PREFERENCES]) {
		throw NodeTranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_WITH_APPLY_INSTALLATION_PREFERENCES);
	}

	if (args[APPLY_CONTENT_PROTECTION] && projectInfoService.getProjectType() === PROJECT_ACP) {
		throw NodeTranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
	}

	if (args[APPLY_INSTALLATION_PREFERENCES] && projectInfoService.getProjectType() === PROJECT_ACP) {
		throw NodeTranslationService.getMessage(INSTALLATION_PREFERENCES_ERRORS.APPLY_INSTALLATION_PREFERENCES_IN_ACP);
	}

	if (args[APPLY_CONTENT_PROTECTION] && !projectInfoService.hasLockAndHideFiles()) {
		throw NodeTranslationService.getMessage(
			ERRORS.APPLY_CONTENT_PROTECTION_WITHOUT_HIDING_AND_LOCKING,
			commandName,
			LINKS.HOW_TO.CREATE_HIDDING_XML,
			LINKS.HOW_TO.CREATE_LOCKING_XML,
		);
	}

	if (args[APPLY_INSTALLATION_PREFERENCES] && !projectInfoService.hasLockAndHideFiles()) {
		throw NodeTranslationService.getMessage(
			INSTALLATION_PREFERENCES_ERRORS.APPLY_INSTALLATION_PREFERENCES_WITHOUT_HIDING_LOCKING_AND_OVERWRITING,
			commandName,
			LINKS.HOW_TO.CREATE_INSTALLATION_PREFERENCES,
		);
	}
}

module.exports = { validate };
