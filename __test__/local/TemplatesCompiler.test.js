/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const TemplatesCompiler = require('../../src/sdf-cli-local/src/compilers/TemplatesCompiler');

const { SERVERPATH, removeFolder, mockClearConsoleLog } = require('./helpers');

const applications = ['shopping', 'checkout', 'myaccount'];

const extensionPath = 'vendor/custom_extension/1.0.0/';
const themePath = 'vendor/custom_theme/1.0.0/';

const Template = jest.fn(function(src, dst) {
	return {
		basesrc: src,
		dst: dst,
		name: path.basename(dst, path.extname(dst)),
		extensionAssetUrl: path.resolve(SERVERPATH, 'assets', extensionPath),
		sourceContent: jest.fn(async () => {
			return '<p>Content</p>';
		}),
		setPrecompiled: jest.fn(val => {
			this.precompiled = val;
		}),
		getBasename: jest.fn(() => {
			return path.basename(src);
		}),
		getFilename: jest.fn(() => {
			return path.basename(dst, path.extname(dst)) + '.tpl.js';
		}),
		getDependencies: jest.fn(() => {
			return ['Handlebars'];
		}),
		logOverrideMessage: jest.fn,
		applications: applications,
	};
});

const resources = [
	new Template('custom_theme/Modules/Home/Templates/home.tpl', 'home.tpl'),
	new Template('custom_theme/Modules/Home/Templates/home_cms.tpl', 'home_cms.tpl'),
];

const Theme = jest.fn(() => ({
	getAssetsUrl: jest.fn(() => {
		return path.resolve(SERVERPATH, 'assets', themePath);
	}),
}));

const CompilationContext = jest.fn(() => ({
	localServerPath: SERVERPATH,
	theme: new Theme(),
	getTemplates: jest.fn(() => {
		return resources;
	}),
}));

mockClearConsoleLog();
afterAll(() => removeFolder('templates'));

const context = new CompilationContext();
const compiler = new TemplatesCompiler({ context: context });

describe('compile', function() {
	beforeAll(async () => {
		await compiler.compile();
	});

	it('should create all template files in the local server processed-templates folder location', () => {
		const resourcesCreated = fs.readdirSync(path.join(context.localServerPath, 'templates/processed-templates'));
		expect(resourcesCreated.length).toStrictEqual(resources.length);
		resources.forEach(resource => {
			expect(resourcesCreated).toContain(resource.dst);
		});
	});

	it('should create one require config file for each application in the local server templates folder location', () => {
		const applicationConfigFilesCreated = fs.readdirSync(path.join(context.localServerPath, 'templates'));
		applications.forEach(application => {
			expect(applicationConfigFilesCreated).toContain(application + '-templates.js');
		});
	});

	it('should create javascript libs file in the local server templates folder location', () => {
		const applicationConfigFilesCreated = fs.readdirSync(path.join(context.localServerPath, 'templates'));
		expect(applicationConfigFilesCreated).toContain('javascript-libs.js');
	});
});
