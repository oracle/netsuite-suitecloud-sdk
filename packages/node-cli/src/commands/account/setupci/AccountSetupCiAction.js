/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { authenticateCi, selectAuthenticationCI } = require('../../../utils/AuthenticationUtils');
const { DOMAIN: { PRODUCTION: { GENERIC_NETSUITE_DOMAIN } } } = require('../../../ApplicationConstants');
const { ACCOUNT_SETUP_CI: { COMMAND: { OPTIONS } } } = require('./AccountSetupCiConstants');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { validateMachineToMachineAuthIsAllowed } = require('../../../services/ExecutionContextService');
const AccountSetupCiValidation = require('./AccountSetupCiValidation');

module.exports = class AccountSetupCiAction extends BaseAction {

	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._validator = new AccountSetupCiValidation(this._commandMetadata, this._runInInteractiveMode);
	}

	preExecute(params) {
		this._projectInfoService.checkWorkingDirectoryContainsValidProject(this._commandMetadata.name);

		if (params[OPTIONS.ACCOUNT]) {
			params[OPTIONS.ACCOUNT] = params[OPTIONS.ACCOUNT].toUpperCase();
		}

		return params;
	}

	async execute(params) {
		if (params[OPTIONS.DOMAIN] === GENERIC_NETSUITE_DOMAIN) {
			delete params[OPTIONS.DOMAIN];
		}

		validateMachineToMachineAuthIsAllowed();

		const isSetupMode = this._isSetupMode(params);
		this._validator.validateActionParametersByMode(params, isSetupMode);
		this._validator.validateAuthIDFormat(this._getAuthId(params), isSetupMode);

		if (isSetupMode) {
			return await authenticateCi(params, this._sdkPath, this._executionPath, this._executionEnvironmentContext);
		} else {
			return await selectAuthenticationCI(this._getAuthId(params), this._sdkPath, this._executionPath);
		}
	}

	_isSetupMode(params) {
		return (!params[OPTIONS.SELECT]);
	}

	_getAuthId(params) {
		return this._isSetupMode(params) ? params[OPTIONS.AUTHID] : params[OPTIONS.SELECT];
	}
}
