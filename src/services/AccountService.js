/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const request = require('request-promise-native');
const assert = require('assert');
const UserPreferencesService = require('./userpreferences/UserPreferencesService');
const TranslationService = require('./TranslationService');
const { ERRORS } = require('./TranslationKeys');
const ERROR_TIMED_OUT = 'ETIMEDOUT';

const NLAuthorizationHeader = {
	name: 'NLAuth',
	params: {
		accountId: 'nlauth_account',
		roleId: 'nlauth_role',
		email: 'nlauth_email',
		password: 'nlauth_signature',
	},
};

module.exports = class AccountService {
	constructor() {
		this._userPreferencesService = new UserPreferencesService();
	}

	getAccountAndRoles({ email, password, restRolesUrl }) {
		assert(email);
		assert(password);
		assert(restRolesUrl);

		const options = {
			url: restRolesUrl,
			proxy: this._userPreferencesService.getUserPreferences().proxyUrl,
			headers: {
				Authorization: this._getNLAuthorizationHeaderString({ email, password }),
			},
		};

		return new Promise(async (resolve, reject) => {
			try {
				const result = await request(options).promise();
				resolve(result);
			} catch (error) {
				reject(this.throwRequestError(error));
			}
		});
	}

	throwRequestError(errorResponse) {
		try {
			// server response with status not OK
			if (errorResponse.statusCode) {
				const errorWithoutBackSlashes = errorResponse.error.replace(/\\/g, '');
				const parsedResponseError = JSON.parse(errorWithoutBackSlashes);
				return parsedResponseError.error.message;
			}
			// timedout response
			if (errorResponse.cause && errorResponse.cause.code === ERROR_TIMED_OUT) {
				return TranslationService.getMessage(ERRORS.TIMED_OUT_CONNECTION);
			}
			// other responses - just forward the message
			if (errorResponse.message) {
				return errorResponse.message;
			}
			// this should not be reached
			TranslationService.getMessage(ERRORS.GENERAL_CONNECTION_PROBLEM);
		} catch (error) {
			return TranslationService.getMessage(ERRORS.GENERAL_CONNECTION_PROBLEM);
		}
	}

	_getNLAuthorizationHeaderString(paramsToAdd) {
		const nlParams = [];
		for (let [key, nlParamName] of Object.entries(NLAuthorizationHeader.params)) {
			if (paramsToAdd[key]) {
				nlParams.push(`${nlParamName}=${encodeURI(paramsToAdd[key])}`);
			}
		}

		return `${NLAuthorizationHeader.name} ${nlParams.join(', ')}`;
	}
};
