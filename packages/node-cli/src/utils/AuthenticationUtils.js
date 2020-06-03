/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('./FileUtils');
const NodeTranslationService = require('../services/NodeTranslationService');
const { ERRORS, COMMAND_SETUPACCOUNT } = require('../services/TranslationKeys');
const { FILES } = require('../ApplicationConstants');
const { ActionResult } = require('../commands/actionresult/ActionResult');
const { executeWithSpinner } = require('../ui/CliSpinner');
const path = require('path');
const SdkExecutionContext = require('../SdkExecutionContext');
const SdkOperationResultUtils = require('./SdkOperationResultUtils');
const SdkExecutor = require('../SdkExecutor').SdkExecutor;

const DEFAULT_AUTH_ID_PROPERTY = 'defaultAuthId';

const COMMANDS = {
	MANAGEAUTH: 'manageauth',
};

const FLAGS = {
	LIST: 'list',
};

module.exports = {

	setDefaultAuthentication(projectFolder, authId) {
		try {
			// nest the values into a DEFAULT_AUTH_ID_PROPERTY property
			const projectConfiguration = {
				[DEFAULT_AUTH_ID_PROPERTY]: authId,
			};
			FileUtils.create(path.join(projectFolder, FILES.PROJECT_JSON), projectConfiguration);
		} catch (error) {
			const errorMessage = error != null && error.message ? NodeTranslationService.getMessage(ERRORS.ADD_ERROR_LINE, error.message) : '';
			throw NodeTranslationService.getMessage(ERRORS.WRITING_PROJECT_JSON, errorMessage);
		}
	},

	getProjectDefaultAuthId(projectFolder) {

		const projectFilePath = path.join(projectFolder, FILES.PROJECT_JSON);
		if (FileUtils.exists(projectFilePath)) {
			try {
				const fileContentJson = FileUtils.readAsJson(projectFilePath);
				if (!fileContentJson.hasOwnProperty(DEFAULT_AUTH_ID_PROPERTY)) {
					throw NodeTranslationService.getMessage(ERRORS.MISSING_DEFAULT_AUTH_ID, DEFAULT_AUTH_ID_PROPERTY);
				}
				return fileContentJson[DEFAULT_AUTH_ID_PROPERTY];
			} catch (error) {
				throw NodeTranslationService.getMessage(ERRORS.WRONG_JSON_FILE, projectFilePath, error);
			}
		}
	},

	async getAuthIds(sdkPath) {

		const sdkExecutor = new SdkExecutor(sdkPath);

		const getAuthListContext = SdkExecutionContext.Builder.forCommand(COMMANDS.MANAGEAUTH)
			.integration()
			.addFlag(FLAGS.LIST)
			.build();

		try {
			const existingAuthIDsResponse = await executeWithSpinner({
				action: sdkExecutor.execute(getAuthListContext),
				message: NodeTranslationService.getMessage(COMMAND_SETUPACCOUNT.MESSAGES.GETTING_AVAILABLE_AUTHIDS),
			});
			if (existingAuthIDsResponse.status === SdkOperationResultUtils.STATUS.ERROR) {
				throw SdkOperationResultUtils.getResultMessage(existingAuthIDsResponse);
			}
			return ActionResult.Builder.withData(existingAuthIDsResponse.data)
				.build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
