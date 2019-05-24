const request = require('request-promise-native');

const {
	HTTPS_SYSTEM_URL,
	PROXY_PORT,
	PROXY_URL,
	REST_ROLES_URL,
} = require('../ApplicationConstants');

const oracleProxy = 'www-proxy-lon.uk.oracle.com';
const httpsRolesUrl = 'https://system.netsuite.com/rest/roles';

class AccountService {
	getAccountAndRoles({ email, password }) {
		const options = {
			url: 'https://system.netsuite.com/rest/roles',
			proxy: 'http://www-proxy-lon.uk.oracle.com:80',
			headers: {
				Authorization: `NLAuth nlauth_email=${email}, nlauth_signature=${password}`,
			},
		};

		return request(options);
	}
}

module.exports = new AccountService();
