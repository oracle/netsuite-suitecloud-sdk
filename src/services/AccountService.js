const request = require('request-promise-native');
const assert = require('assert');
const UserPreferencesService = require('./userpreferences/UserPreferencesService');
const { REST_ISSUE_TOKEN_URL } = require('../ApplicationConstants');

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
				Authorization: `NLAuth nlauth_email=${email}, nlauth_signature=${password}`,
			},
		};

		return request(options);
	}

	getIssueToken({ accountId, roleId, email, password }) {
		console.log(`accountId:${accountId}, roleId:${roleId}, email:${email}`)
		const options = {
			url: REST_ISSUE_TOKEN_URL,
			proxy: this._userPreferencesService.getUserPreferences().proxyUrl,
			headers: {
				Authorization: `NLAuth nlauth_account=${accountId}, nlauth_role=${roleId}, nlauth_email=${email}, nlauth_signature=${password}`,
			},
		};

		return request(options);
	}
};
