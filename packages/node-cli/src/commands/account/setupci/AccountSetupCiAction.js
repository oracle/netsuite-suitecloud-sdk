/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { authenticateCi } = require('../../../utils/AuthenticationUtils');
const { DOMAIN: { PRODUCTION: { GENERIC_NETSUITE_DOMAIN } } } = require('../../../ApplicationConstants');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { validateMachineToMachineAuthIsAllowed } = require('../../../services/ExecutionContextService');

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
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	preExecute(params) {
		this._projectInfoService.checkWorkingDirectoryContainsValidProject(this._commandMetadata.name);
		
		if (params[COMMAND.OPTIONS.ACCOUNT]) {
			params[COMMAND.OPTIONS.ACCOUNT] = params[COMMAND.OPTIONS.ACCOUNT].toUpperCase();
		}
		return params;
	}

	async execute(params) {
		if (params[COMMAND.OPTIONS.DOMAIN] === GENERIC_NETSUITE_DOMAIN) {
			delete params[COMMAND.OPTIONS.DOMAIN];
		}
		validateMachineToMachineAuthIsAllowed();
		return await authenticateCi(params, this._sdkPath, this._executionPath, this._executionEnvironmentContext);
	}
};
