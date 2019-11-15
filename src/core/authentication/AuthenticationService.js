/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('../../utils/FileUtils');
const TranslationService = require('../../services/TranslationService');
const { ERRORS } = require('../../services/TranslationKeys');
const { FILE_NAMES } = require('../../ApplicationConstants');
const assert = require('assert');
const path = require('path');

let CACHED_DEFAULT_AUTH_ID;
module.exports = class AuthenticationService {
	constructor(executionPath) {
		assert(executionPath)
		this._excutionPath = executionPath;
	}
	
	setDefaultAuthentication(authId) {
		try {
			// nest the values into a 'defaultAuthId' property
			const projectConfiguration = {
				defaultAuthId: authId,
			};
			FileUtils.create(path.join(this._excutionPath,FILE_NAMES.PROJECT_JSON), projectConfiguration);
		} catch (error) {
			const errorMessage =
				error != null && error.message ? TranslationService.getMessage(ERRORS.ADD_ERROR_LINE, error.message) : '';
			throw TranslationService.getMessage(ERRORS.WRITING_PROJECT_JSON, errorMessage);
		}
	}

	getProjectDefaultAuthId() {
		if (CACHED_DEFAULT_AUTH_ID) {
			return CACHED_DEFAULT_AUTH_ID;
		}
		const projectFilePath = path.join(this._excutionPath,FILE_NAMES.PROJECT_JSON);
		if (FileUtils.exists(projectFilePath)) {
			const fileContentJson = FileUtils.readAsJson(projectFilePath);
			CACHED_DEFAULT_AUTH_ID = fileContentJson.defaultAuthId;
			return CACHED_DEFAULT_AUTH_ID;
		}
	}
};
