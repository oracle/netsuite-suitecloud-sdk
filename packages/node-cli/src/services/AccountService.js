/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const request = require('request-promise-native');
const assert = require('assert');
const CLISettingsService = require('./settings/CLISettingsService');
const NodeTranslationService = require('./NodeTranslationService');
const { ERRORS } = require('./TranslationKeys');
const ERROR_TIMED_OUT = 'ETIMEDOUT';
const ENOTFOUND = 'ENOTFOUND';

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
		this._CLISettingsService = new CLISettingsService();
	}

	getAccountAndRoles({ email, password, restRolesUrl, isDevelopment }) {
		const options = this._getRequestOptions(email, password, restRolesUrl, isDevelopment);

		return new Promise(async (resolve, reject) => {
			try {
				const result = await request(options).promise();
				resolve(result);
			} catch (error) {
				reject(this.throwRequestError(error));
			}
		});
	}

	_getRequestOptions(email, password, restRolesUrl, isDevelopment) {
		assert(email);
		assert(password);
		assert(restRolesUrl);
		assert(typeof isDevelopment === 'boolean');

		const authorizationHeader = this._getNLAuthorizationHeaderString({ email, password });

		return {
			url: restRolesUrl,
			headers: {
				Authorization: authorizationHeader,
			},
			...(!isDevelopment && { proxy: this._CLISettingsService.getProxyUrl() }),
		};
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
				return NodeTranslationService.getMessage(ERRORS.TIMED_OUT_CONNECTION);
			}
			// unable to reach a scrumbox url
			if (errorResponse.cause && errorResponse.cause.code === ENOTFOUND) {
				return NodeTranslationService.getMessage(ERRORS.SCRUMBOX_URL_NOT_FOUND, errorResponse.cause.host, errorResponse.message);
			}
			// other responses - just forward the message
			if (errorResponse.message) {
				return errorResponse.message;
			}
			// this should not be reached
			NodeTranslationService.getMessage(ERRORS.GENERAL_CONNECTION_PROBLEM);
		} catch (error) {
			return NodeTranslationService.getMessage(ERRORS.GENERAL_CONNECTION_PROBLEM);
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
