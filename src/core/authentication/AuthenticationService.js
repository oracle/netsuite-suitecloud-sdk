/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('../../utils/FileUtils');
const TranslationService = require('../../services/TranslationService');
const { lineBreak } = require('../../utils/NodeUtils');
const { ERRORS } = require('../../services/TranslationKeys');
const { FILE_NAMES } = require('../../ApplicationConstants');

let CACHED_DEFAULT_AUTH_ID;
module.exports = class AuthenticationService {
	setDefaultAuthentication(authId) {
		try {
			// nest the values into a 'defaultAuthId' property
			const projectConfiguration = {
				defaultAuthId: authId,
			};
			FileUtils.create(FILE_NAMES.PROJECT_JSON, projectConfiguration);
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
		if (FileUtils.exists(FILE_NAMES.PROJECT_JSON)) {
			const fileContentJson = FileUtils.readAsJson(FILE_NAMES.PROJECT_JSON);
			CACHED_DEFAULT_AUTH_ID = fileContentJson.defaultAuthId;
			return CACHED_DEFAULT_AUTH_ID;
		}
	}
};
