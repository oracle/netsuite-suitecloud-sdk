/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const BaseAction = require('../../base/BaseAction');
const { saveToken } = require('../../../utils/AuthenticationUtils');
const { DOMAIN: { PRODUCTION: {GENERIC_NETSUITE_DOMAIN} } } = require('../../../ApplicationConstants');
const CommandOptionsValidator = require('../../../core/CommandOptionsValidator');
const ValidationErrorsFormatter = require('../../../utils/ValidationErrorsFormatter');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const FileUtils = require('../../../utils/FileUtils');
const { ERRORS } = require('../../../services/TranslationKeys');
const {
	FILES: { MANIFEST_XML },
} = require('../../../ApplicationConstants');
const CLIException = require('../../../CLIException');
const { lineBreak } = require('../../../loggers/LoggerConstants');
const { LINKS: { INFO } } = require('../../../ApplicationConstants');

const COMMAND = {
	OPTIONS: {
		URL: 'url',
		ACCOUNT: 'account',
	},
	SDK_COMMAND: 'authenticate',
	VALIDATION: {
		SAVE_TOKEN: {
			MANDATORY_OPTIONS: {
				authid: {
					name: 'authid',
					mandatory: true,
				},
				tokenid: {
					name: 'tokenid',
					mandatory: true,
				},
				tokensecret: {
					name: 'tokensecret',
					mandatory: true,
				},
				account: {
					name: 'account',
					mandatory: true,
				},
			},
		},
	},
};

module.exports = class AccountSaveTokenAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		this._checkWorkingDirectoryContainsValidProject();
		if (params[COMMAND.OPTIONS.ACCOUNT]) {
			params[COMMAND.OPTIONS.ACCOUNT] = params[COMMAND.OPTIONS.ACCOUNT].toUpperCase();
		}
		return params;
	}

	async execute(params) {
		const commandOptionsValidator = new CommandOptionsValidator();
		const validationErrors = commandOptionsValidator.validate({
			commandOptions: COMMAND.VALIDATION.SAVE_TOKEN.MANDATORY_OPTIONS,
			arguments: params,
		});
		if (validationErrors.length > 0) {
			throw new CLIException(ValidationErrorsFormatter.formatErrors(validationErrors));
		}
		if (params[COMMAND.OPTIONS.URL] === GENERIC_NETSUITE_DOMAIN) {
			delete params[COMMAND.OPTIONS.URL];
		}
		return await saveToken(params, this._sdkPath, this._executionPath, this._executionEnvironmentContext);

	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			const errorMessage = NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder, this._commandMetadata.name)
				+ lineBreak + NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, INFO.PROJECT_STRUCTURE);
			throw new CLIException(errorMessage);
		}
	}
};
