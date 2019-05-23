const https = require('https');
const http = require('http');
const assert = require('assert');

const {
	HTTPS_SYSTEM_URL,
	PROXY_PORT,
	PROXY_URL,
	REST_ROLES_URL,
} = require('../ApplicationConstants');


class AccountService {
	getAccountAndRoles ({ email, password }) {
		assert(email);
		assert(password);

		const options = {
			hostname: 'www-proxy-lon.uk.oracle.com',
			port: '80',
			path: 'https://system.netsuite.com/rest/roles',
			headers: {
				Host: 'system.netsuite.com',
				Authorization: `NLAuth nlauth_email=${email}, nlauth_signature=${password}`,
			},
		};

		const optionsHttps = {
			hostname: 'system.netsuite.com',
			path: '/rest/roles',
			headers: {
				Authorization: `NLAuth nlauth_email=${email}, nlauth_signature=${password}`,
			},
		}

		const optionsG = {
			hostname: PROXY_URL,
			port: PROXY_PORT,
			path: 'https://www.google.com',
		};

		

		const respFunc = resp => {
			let data = '';

			// A chunk of data has been recieved.
			resp.on('data', chunk => {
				data += chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				console.log('Lets see what we have on data');
				console.log(data);
				console.log('then JSON parse and print .explanation');
				console.log(JSON.parse(data));
			});
		};

		const errorFunc = err => {
			console.log('Error: ' + err.message);
			console.log(err);
		};

		console.log(options)
		http.get(options, respFunc).on('error', errorFunc);

		// console.log(optionsHttps)
		// https.get(optionsHttps, respFunc).on('error', errorFunc);
	}
}

module.exports = new AccountService();