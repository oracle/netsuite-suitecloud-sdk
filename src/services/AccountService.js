const request = require('request-promise-native');

const {
	PROXY_URL,
	REST_ROLES_URL,
} = require('../ApplicationConstants');

class AccountService {
	getAccountAndRoles({ email, password }) {
		const options = {
			url: REST_ROLES_URL,
			proxy: PROXY_URL,
			headers: {
				Authorization: `NLAuth nlauth_email=${email}, nlauth_signature=${password}`,
			},
		};

		return request(options);
	}
}

module.exports = new AccountService();
