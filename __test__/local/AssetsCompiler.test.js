/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const AssetsCompiler = require('../../src/sdf-cli-local/src/compilers/AssetsCompiler');

const { SERVERPATH, CUSTOM_ASSETS_PATH, removeFolder, mockClearConsoleLog, createLocalserverFolder } = require('./helpers');

let assetsCompiler;
let context;

const Asset = jest.fn((src, dst) => ({
	dst: dst,
	fullsrc: jest.fn(() => {
		return path.join(CUSTOM_ASSETS_PATH, src);
	}),
}));

const assets = [
	new Asset('custom_theme/assets/img/carousel-home-1.png', 'assets/vendor/custom_theme/1.0.0/dst1.png'),
	new Asset('custom_theme/assets/img/carousel-home-2.png', 'assets/vendor/custom_theme/1.0.0/dst2.jpg'),
];

const CompilationContext = jest.fn(() => ({
	localServerPath: SERVERPATH,
	getAssets: jest.fn(() => {
		return assets;
	}),
}));

mockClearConsoleLog();
afterAll(() => removeFolder('assets'));

context = new CompilationContext();
assetsCompiler = new AssetsCompiler({ context: context });

describe('compile', function() {
	beforeAll(async () => {
		createLocalserverFolder();
		await assetsCompiler.compile();
	});

	it('should create all assets files in the local server folder location', () => {
		const assetsCreated = fs.readdirSync(path.join(context.localServerPath, 'assets/vendor/custom_theme/1.0.0'));
		expect(assetsCreated.length).toStrictEqual(assets.length);
		assets.forEach(asset => {
			expect(assetsCreated).toContain(path.basename(asset.dst));
		});
	});
});
