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

	throwRequestError(err) {
		if (err.statusCode) {
			return JSON.parse(err.error).error.message;
		} else {
			return err.message;
		}
	}

	_getNLAuthorizationHeaderString(paramsToAdd) {
		const nlParams = [];
		for (let [key, nlParamName] of Object.entries(NLAuthorizationHeader.params)) {
			if (paramsToAdd[key]) {
				nlParams.push(`${nlParamName}=${paramsToAdd[key]}`);
			}
		}

		return `${NLAuthorizationHeader.name} ${nlParams.join(', ')}`;
	}
};
