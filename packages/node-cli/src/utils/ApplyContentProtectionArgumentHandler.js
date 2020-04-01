/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const assert = require('assert');

const {
	LINKS,
	PROJECT_ACP,
	PROJECT_SUITEAPP,
	SDK_FALSE,
	SDK_TRUE,
} = require('../ApplicationConstants');

const APPLY_CONTENT_PROTECTION = 'applycontentprotection';

const {
	UTILS: {
		APPLY_CONTENT_PROTECTION_ARGUMENT_HANDLER: { ERRORS },
	},
} = require('../services/TranslationKeys');

module.exports = class ApplyContentProtectionArgumentHandler {
	constructor(options) {
		assert(options.projectInfoService);
		assert(options.commandName);
		this._projectInfoService = options.projectInfoService;
		this._commandName = options.commandName;
	}

	validate(args) {
		if (
			args[APPLY_CONTENT_PROTECTION] &&
			this._projectInfoService.getProjectType() === PROJECT_ACP
		) {
			throw NodeTranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
		}

		if (args[APPLY_CONTENT_PROTECTION] && !this._projectInfoService.hasLockAndHideFiles()) {
			throw NodeTranslationService.getMessage(
				ERRORS.APPLY_CONTENT_PROTECTION_WITHOUT_HIDING_AND_LOCKING,
				this._commandName,
				LINKS.HOW_TO.CREATE_HIDDING_XML,
				LINKS.HOW_TO.CREATE_LOCKING_XML
			);
		}
	}

	transformArgument(args) {
		const newArgs = {};

		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			newArgs[APPLY_CONTENT_PROTECTION] = args[APPLY_CONTENT_PROTECTION]
				? SDK_TRUE
				: SDK_FALSE;
		}

		return newArgs;
	}
};
