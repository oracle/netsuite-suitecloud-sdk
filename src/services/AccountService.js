const request = require('request-promise-native');
const assert = require('assert');
const UserPreferencesService = require('./userpreferences/UserPreferencesService');
const Base64 = require('../utils/Base64');
const { REST_ISSUE_TOKEN_URL, CONSUMER_REQUEST_PARAM } = require('../ApplicationConstants');
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

	getIssueToken(accountDetails) {
		assert(accountDetails);
		assert(accountDetails.accountId);
		assert(accountDetails.roleId);
		assert(accountDetails.email);
		assert(accountDetails.password);

		const options = {
			url: REST_ISSUE_TOKEN_URL,
			qs: {
				[CONSUMER_REQUEST_PARAM.KEY]: Base64.decode(CONSUMER_REQUEST_PARAM.VALUE),
			},
			proxy: this._userPreferencesService.getUserPreferences().proxyUrl,
			headers: {
				Authorization: this._getNLAuthorizationHeaderString({
					accountId: accountDetails.accountId,
					roleId: accountDetails.roleId,
					email: accountDetails.email,
					password: accountDetails.password,
				}),
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
				const parsedResponseError = JSON.parse(errorResponse.error);
				return parsedResponseError.error.message;
			}
			// timedout response
			else if (errorResponse.cause && errorResponse.cause.code === ERROR_TIMED_OUT) {
				return TranslationService.getMessage(ERRORS.TIMED_OUT_CONNECTION);
			} 
			// other responses - just forward the message
			else if (errorResponse.message) {
				return errorResponse.message;
			} 
			// this should not be reached
			else {
				TranslationService.getMessage(ERRORS.GENERAL_CONNECTION_PROBLEM);
			}
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
