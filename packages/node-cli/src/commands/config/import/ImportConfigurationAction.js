/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const { PROJECT_ACP } = require('../../../ApplicationConstants');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { COMMAND_CONFIGIMPORT } = require('../../../services/TranslationKeys');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const BaseAction = require('../../base/BaseAction');
const { executeImportConfiguration } = require('@oracle/suitecloud-sdk-core').commands;
const { executeWithAuthRetry, shouldRetryAuthByResult } = require('@oracle/suitecloud-sdk-core').auth;

module.exports = class ImportConfigurationAction extends BaseAction {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	async execute(params) {
		try {
			if (this._projectInfoService.getProjectType() !== PROJECT_ACP) {
				return ActionResult.Builder.withErrors([
					NodeTranslationService.getMessage(COMMAND_CONFIGIMPORT.ERRORS.IS_SUITEAPP),
				]).build();
			}
			const operationResult = await executeWithSpinner({
				action: this._executeImportWithAuthRetry(params.authid),
				message: NodeTranslationService.getMessage(COMMAND_CONFIGIMPORT.MESSAGES.IMPORTING),
			});
			const commandParameters = { authid: params.authid };
			return operationResult.status === 'SUCCESS'
				? ActionResult.Builder.withData(operationResult.data).withCommandParameters(commandParameters).build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(commandParameters).build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	_executeImportWithAuthRetry(authId) {
		return executeWithAuthRetry({
			authId,
			authSessionProvider: createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext),
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeImportConfiguration({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				projectFolder: this._projectFolder,
				userAgent: this._executionEnvironmentContext?.toUserAgentString?.(),
			}),
		});
	}
};
