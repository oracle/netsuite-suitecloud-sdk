/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const ProjectInfoService = require('../services/ProjectInfoService');
const { LINKS, PROJECT_ACP } = require('../ApplicationConstants');

const APPLY_CONTENT_PROTECTION = 'applycontentprotection';

const {
	UTILS: {
		APPLY_CONTENT_PROTECTION_ARGUMENT_HANDLER: { ERRORS },
	},
} = require('../services/TranslationKeys');

function validate(args, projectFolder, commandName) {
	const projectInfoService = new ProjectInfoService(projectFolder);
	if (args[APPLY_CONTENT_PROTECTION] && projectInfoService.getProjectType() === PROJECT_ACP) {
		throw NodeTranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
	}

	if (args[APPLY_CONTENT_PROTECTION] && !projectInfoService.hasLockAndHideFiles()) {
		throw NodeTranslationService.getMessage(
			ERRORS.APPLY_CONTENT_PROTECTION_WITHOUT_HIDING_AND_LOCKING,
			commandName,
			LINKS.HOW_TO.CREATE_HIDDING_XML,
			LINKS.HOW_TO.CREATE_LOCKING_XML
		);
	}
}

module.exports = { validate, APPLY_CONTENT_PROTECTION };
