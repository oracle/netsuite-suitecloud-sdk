/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const BaseAction = require('../../base/BaseAction');
const { auhtenticateCi } = require('../../../utils/AuthenticationUtils');
const { DOMAIN: { PRODUCTION: { GENERIC_NETSUITE_DOMAIN } } } = require('../../../ApplicationConstants');
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
		ACCOUNT: 'account',
		AUTHID: 'authid',
		CERTIFCATEID: 'certificateid',
		PRIVATEKEYPATH: 'privatekeypath',
		DOMAIN: 'domain'

	},
	SDK_COMMAND: 'authenticateci',
};

module.exports = class AccountSetupCiAction extends BaseAction {
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
		if (params[COMMAND.OPTIONS.DOMAIN] === GENERIC_NETSUITE_DOMAIN) {
			delete params[COMMAND.OPTIONS.DOMAIN];
		}
		return await auhtenticateCi(params, this._sdkPath, this._executionPath, this._executionEnvironmentContext);

	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			const errorMessage = NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder, this._commandMetadata.name)
				+ lineBreak + NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, INFO.PROJECT_STRUCTURE);
			throw new CLIException(errorMessage);
		}
	}
};
