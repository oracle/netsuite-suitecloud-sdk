const request = require('request-promise-native');
const assert = require('assert');
const UserPreferencesService = require('./userpreferences/UserPreferencesService');
const Base64 = require('../utils/Base64');
const { REST_ISSUE_TOKEN_URL, CONSUMER_REQUEST_PARAM } = require('../ApplicationConstants');
const NLAuthorizationHeader = {
	name: 'NLAuth',
	params: {
		accountId: 'nlauth_account',
		roleId: 'nlauth_role',
		email: 'nlauth_email',
		password: 'nlauth_signature'
	}
}

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

		return request(options);
	}

	getIssueToken({ accountId, roleId, email, password }) {
		assert(accountId);
		assert(roleId);
		assert(email);
		assert(password);

		const options = {
			url: REST_ISSUE_TOKEN_URL,
			qs: {
				[CONSUMER_REQUEST_PARAM.KEY]: Base64.decode(CONSUMER_REQUEST_PARAM.VALUE)
			},
			proxy: this._userPreferencesService.getUserPreferences().proxyUrl,
			headers: {
				Authorization: this._getNLAuthorizationHeaderString({ accountId, roleId, email, password }),
			},
		};

		return request(options);
	}

	throwRequestError(err) {
		if (err.statusCode) {
			throw JSON.parse(err.error).error.message;
		} else {
			throw err.message;
		}
	}

	_getNLAuthorizationHeaderString(paramsToAdd) {
		const nlParams = [];
		for(let [key, nlParamName] of Object.entries(NLAuthorizationHeader.params)) {
			if(paramsToAdd[key]) {
				nlParams.push(`${nlParamName}=${paramsToAdd[key]}`)
			}
		}

		return `${NLAuthorizationHeader.name} ${nlParams.join(', ')}`
	}
};
