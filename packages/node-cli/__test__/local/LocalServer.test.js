/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const { promisify } = require('util');
const request = require('request');
const url = require('url');
const LocalServer = require('@oracle/suitecloud-cli-localserver-command/src/LocalServer');
const requestGet = promisify(request.get);

const { SERVERPATH, mockClearConsoleLog, createLocalserverFolder } = require('./helpers');

const CompilationContext = jest.fn(() => ({
	localServerPath: SERVERPATH,
}));

mockClearConsoleLog();

const context = new CompilationContext();
const baseUrl = 'http://localhost:7777/';

describe('startServer', function() {
	beforeAll(async () => {
		createLocalserverFolder();
	});
	it('should open a server in the 7777 port', async () => {
		LocalServer.startServer(context.localServerPath);
		await new Promise(resolve => setTimeout(resolve, 1500));
		let error;
		try {
			await requestGet(baseUrl);
		} catch (er) {
			error = er;
		}
		expect(error).toBeUndefined();
	});

	it('should get a script in /define_patch.js url', async function() {
		const { body, statusCode } = await requestGet(url.resolve(baseUrl, 'define_patch.js'));
		expect(statusCode).toBe(200);
		expect(body).toContain('function define_patch()');
	});

	it('should get a json in /who url', async function() {
		const response = await requestGet(url.resolve(baseUrl, 'who/checkout'));

		expect(response.statusCode).toBe(200);

		const json = JSON.parse(response.body);
		const resourcesExpected = ['css', 'requirejs', 'define_patch', 'javascript_libs', 'templates', 'js_core', 'js_extensions'];

		expect(json.length).toBe(resourcesExpected.length);

		json.forEach(element => {
			expect(resourcesExpected).toContain(element.resource);
		});
	});
});

describe('closeServer', function() {
	it('close the server in port 7777', async function() {
		LocalServer.closeServer();
	});
});
