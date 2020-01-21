/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const SassCompiler = require('@oracle/sdf-cli-local/src/compilers/SassCompiler');

const { ROOT, SERVERPATH, removeFolder, mockClearConsoleLog, createLocalserverFolder } = require('./helpers');

const resources = {
	entrypoints: {
		shopping: [
			{
				entry: 'custom_theme/Modules/Shopping/shopping.scss',
				assetsPath: 'assets/SuiteCommerce/custom_theme/19.2.0',
			},
		],
		myaccount: [
			{
				entry: 'custom_theme/Modules/MyAccount/myaccount.scss',
				assetsPath: 'assets/SuiteCommerce/custom_theme/19.2.0',
			},
		],
		checkout: [
			{
				entry: 'custom_theme/Modules/Checkout/checkout.scss',
				assetsPath: 'assets/SuiteCommerce/Suite_Commerce_Base_Theme/19.2.0',
			},
		],
	},
};

const CompilationContext = jest.fn(() => ({
	localServerPath: SERVERPATH,
	filesPath: path.join(ROOT, 'custom_assets'),
	getSass: jest.fn(() => {
		return resources;
	}),
	getSassOverrides: jest.fn(() => {
		return [];
	}),
}));

mockClearConsoleLog();
afterAll(() => removeFolder('css'));

const context = new CompilationContext();
const compiler = new SassCompiler({ context: context });

describe('compile', function() {
	beforeAll(async () => {
		createLocalserverFolder();
		await compiler.compile();
	});

	it('should create all sass files in the local server css folder location', () => {
		const resourcesCreated = fs.readdirSync(path.join(context.localServerPath, 'css'));
		expect(resourcesCreated.length).toStrictEqual(Object.keys(resources.entrypoints).length);
	});
});
