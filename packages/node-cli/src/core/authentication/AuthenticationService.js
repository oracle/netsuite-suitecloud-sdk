/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('../../utils/FileUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { ERRORS, COMMAND_SETUPACCOUNT } = require('../../services/TranslationKeys');
const { FILES } = require('../../ApplicationConstants');
const assert = require('assert');
const { executeWithSpinner } = require('../../ui/CliSpinner');
const path = require('path');
const SdkExecutionContext = require('../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../utils/SdkOperationResultUtils');

const DEFAULT_AUTH_ID_PROPERTY = 'defaultAuthId';

const COMMANDS = {
	MANAGEAUTH: 'manageauth',
};

const FLAGS = {
	LIST: 'list',
};

module.exports = class AuthenticationService {
	constructor(executionPath) {
		assert(executionPath);
		this._CACHED_DEFAULT_AUTH_ID = null;
		this._excutionPath = executionPath;
	}

	setDefaultAuthentication(authId) {
		try {
			// nest the values into a DEFAULT_AUTH_ID_PROPERTY property
			const projectConfiguration = {
				[DEFAULT_AUTH_ID_PROPERTY]: authId,
			};
			FileUtils.create(path.join(this._excutionPath, FILES.PROJECT_JSON), projectConfiguration);
		} catch (error) {
			const errorMessage = error != null && error.message ? NodeTranslationService.getMessage(ERRORS.ADD_ERROR_LINE, error.message) : '';
			throw NodeTranslationService.getMessage(ERRORS.WRITING_PROJECT_JSON, errorMessage);
		}
	}

	getProjectDefaultAuthId() {
		if (this._CACHED_DEFAULT_AUTH_ID) {
			return this._CACHED_DEFAULT_AUTH_ID;
		}

		const projectFilePath = path.join(this._excutionPath, FILES.PROJECT_JSON);

		if (FileUtils.exists(projectFilePath)) {
			try {
				const fileContentJson = FileUtils.readAsJson(projectFilePath);
				if (!fileContentJson.hasOwnProperty(DEFAULT_AUTH_ID_PROPERTY)) {
					throw NodeTranslationService.getMessage(ERRORS.MISSING_DEFAULT_AUTH_ID, DEFAULT_AUTH_ID_PROPERTY);
				}
				this._CACHED_DEFAULT_AUTH_ID = fileContentJson[DEFAULT_AUTH_ID_PROPERTY];
				return this._CACHED_DEFAULT_AUTH_ID;
			} catch (error) {
				throw NodeTranslationService.getMessage(ERRORS.WRONG_JSON_FILE, projectFilePath, error);
			}
		}
	}

	async getAuthIds(sdkExecutor) {
		const getAuthListContext = new SdkExecutionContext({
			command: COMMANDS.MANAGEAUTH,
			flags: [FLAGS.LIST],
		});
		const existingAuthIDsResponse = await executeWithSpinner({
			action: sdkExecutor.execute(getAuthListContext),
			message: NodeTranslationService.getMessage(COMMAND_SETUPACCOUNT.MESSAGES.GETTING_AVAILABLE_AUTHIDS),
		});
		if (existingAuthIDsResponse.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw SdkOperationResultUtils.collectErrorMessages(existingAuthIDsResponse);
		}
		return existingAuthIDsResponse.data;
	}
};
