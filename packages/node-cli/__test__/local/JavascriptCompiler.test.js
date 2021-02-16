/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const JavascriptCompiler = require('@oracle/suitecloud-cli-localserver-command/src/compilers/JavascriptCompiler');

const { SERVERPATH, removeFolder, createLocalserverFolder, mockClearConsoleLog } = require('./helpers');

// const extensionPath = 'vendor/custom_extension/1.0.0/';
const themePath = 'vendor/custom_theme/1.0.0/';
const extensionFullname = 'vendor#custom_theme#1.0.0';

const applications = ['shopping', 'checkout', 'myaccount'];

const Script = jest.fn(function(options = { src, dst, applications, isEntrypoint }) {
	const name = path.basename(options.dst, path.extname(options.dst));
	return {
		basesrc: options.src,
		dst: options.dst,
		name: name,
		extensionFullname: extensionFullname,
		sourceContent: jest.fn(async () => {
			return `define('${name}', [], ()=>{});\n`;
		}),
		getBasename: jest.fn(() => {
			return path.basename(options.src);
		}),
		getFilename: jest.fn(() => {
			return name + '.js';
		}),
		logOverrideMessage: jest.fn,
		isEntrypoint: options.isEntrypoint,
		applications: applications,
	};
});

const resources = [
	new Script({
		src: 'custom_extension/Modules/module1/Javascript/ExtTest.View.js',
		dst: 'ExtTest.View.js',
		isEntrypoint: false,
	}),
	new Script({
		src: 'custom_extension/Modules/module1/Javascript/vendor.ExtTest.module1.js',
		dst: 'vendor.ExtTest.module1.js',
		isEntrypoint: true,
	}),
];

const Theme = jest.fn(() => ({
	getAssetsUrl: jest.fn(() => {
		return path.resolve(SERVERPATH, 'assets', themePath);
	}),
}));

const Extension = jest.fn(() => ({}));

const CompilationContext = jest.fn(() => ({
	localServerPath: SERVERPATH,
	theme: new Theme(),
	extensions: [new Extension()],
	getJavascript: jest.fn(() => {
		return resources;
	}),
}));

mockClearConsoleLog();
afterAll(() => removeFolder('javascript'));

const context = new CompilationContext();
const compiler = new JavascriptCompiler({ context: context });

describe('compile', function() {
	beforeAll(async () => {
		createLocalserverFolder();
		await compiler.compile();
	});

	it('should create all javascript files in the local server folder', () => {
		const resourcesCreated = fs.readdirSync(path.join(context.localServerPath, 'javascript'));
		expect(resourcesCreated.length).toStrictEqual(applications.length);
	});

	it('should always write the entrypoint after the other js files content', () => {
		applications.forEach(app => {
			const resourceContent = fs.readFileSync(path.join(context.localServerPath, 'javascript', app + '_ext.js')).toString();
			expect(resourceContent.indexOf('ExtTest.View')).toBeGreaterThan(-1); // normal script defined in resources
			expect(resourceContent.indexOf('vendor.ExtTest.module1')).toBeGreaterThan(-1); // entrypoint script defined in resources
			expect(resourceContent.indexOf('vendor.ExtTest.module1')).toBeGreaterThan(resourceContent.indexOf('ExtTest.View'));
		});
	});
});
