/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('../../utils/FileUtils');
const TranslationService = require('../../services/TranslationService');
const { lineBreak } = require('../../utils/NodeUtils');
const { ERRORS } = require('../../services/TranslationKeys');
const { PROJECT_FILENAME } = require('../../ApplicationConstants');

let CACHED_DEFAULT_AUTH_ID;
module.exports = class AuthenticationService {
	setDefaultAuthentication(authId) {
		try {
			// nest the values into a 'default' property
			const projectConfiguration = {
				defaultAuthId: authId,
			};
			FileUtils.create(PROJECT_FILENAME, projectConfiguration);
		} catch (error) {
			const errorMessage =
				error != null && error.message ? `${lineBreak}Error: ${error.message}` : '';
			throw TranslationService.getMessage(ERRORS.WRITING_ACCOUNT_JSON, errorMessage); //CHANGE TO WRITING_PROJECT_JSON
		}
	}

	getProjectDefaultAuthId() {
		if (CACHED_DEFAULT_AUTH_ID) {
			return CACHED_DEFAULT_AUTH_ID;
		}
		if (FileUtils.exists(PROJECT_FILENAME)) {
			const fileContentJson = FileUtils.readAsJson(PROJECT_FILENAME);
			CACHED_DEFAULT_AUTH_ID = fileContentJson.defaultAuthId;
			return CACHED_DEFAULT_AUTH_ID;
		}
	}
};
