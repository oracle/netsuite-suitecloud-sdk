/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const BaseAction = require('../../base/BaseAction');
const { saveToken } = require('../../../utils/AuthenticationUtils');
const { PROD_ENVIRONMENT_ADDRESS } = require('../../../ApplicationConstants');
const CommandOptionsValidator = require('../../../core/CommandOptionsValidator');
const ValidationErrorsFormatter = require('../../../utils/ValidationErrorsFormatter');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const FileUtils = require('../../../utils/FileUtils');
const { COMMAND_ACCOUNTCI, ERRORS } = require('../../../services/TranslationKeys');
const {
	FILES: { MANIFEST_XML },
} = require('../../../ApplicationConstants');
const CLIException = require('../../../CLIException');

const COMMAND = {
	OPTIONS: {
		URL: 'url',
		DEV: 'dev',
		ACCOUNT: 'account',
	},
	FLAGS: {
		SAVETOKEN: 'savetoken',
	},
	SDK_COMMAND: 'authenticate',
	VALIDATION: {
		SAVE_TOKEN: {
			MANDATORY_OPTIONS: {
				savetoken: {
					name: 'savetoken',
					mandatory: true,
				},
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

module.exports = class AccountCiAction extends BaseAction {
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
		if (params[COMMAND.FLAGS.SAVETOKEN]) {
			const commandOptionsValidator = new CommandOptionsValidator();
			const validationErrors = commandOptionsValidator.validate({
				commandOptions: COMMAND.VALIDATION.SAVE_TOKEN.MANDATORY_OPTIONS,
				arguments: params,
			});
			if (validationErrors.length > 0) {
				throw new CLIException(ValidationErrorsFormatter.formatErrors(validationErrors));
			}
			// If url is system.netsuite.com, we must not pass it to the sdk. If it's anything else, we must add developmentMode flag
			if (params[COMMAND.OPTIONS.URL] === PROD_ENVIRONMENT_ADDRESS) {
				delete params[COMMAND.OPTIONS.URL];
			} else if (params[COMMAND.OPTIONS.URL]) {
				params[COMMAND.OPTIONS.DEV] = true;
			}
			return await saveToken(params, this._sdkPath, this._executionPath);
		} else {
			throw new CLIException(NodeTranslationService.getMessage(COMMAND_ACCOUNTCI.SAVETOKEN_MANDATORY));
		}
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw new CLIException(NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder, this._commandMetadata.name));
		}
	}
};
