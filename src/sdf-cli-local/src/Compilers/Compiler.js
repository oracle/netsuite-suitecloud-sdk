/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const SassCompiler = require('./SassCompiler');
const TemplatesCompiler = require('./TemplatesCompiler');
const JavascriptCompiler = require('./JavascriptCompiler');
const AssetsCompiler = require('./AssetsCompiler');

const fs = require('fs');
const path = require('path');
const Utils = require('../Utils');
const FileSystem = require('../services/FileSystem');

module.exports = class Compiler {
	constructor(options) {
		this.context = options.context;
		this.compilers = {
			sass: new SassCompiler({ context: this.context }),
			templates: new TemplatesCompiler({ context: this.context }),
			javascript: new JavascriptCompiler({ context: this.context }),
			assets: new AssetsCompiler({ context: this.context }),
		};
	}

	compile() {
		this._createLocalServerFolder(this.context);

		const binded_compilers = [];
		for (const name in this.compilers) {
			const compiler = this.compilers[name];
			binded_compilers.push(() => compiler.compile.apply(compiler));
		}
		return Utils.runParallel(binded_compilers);
	}

	_createLocalServerFolder(context) {
		const serverFolder = 'LocalServer';
		// create/override local server:
		const local_folder = FileSystem.createFolder(serverFolder, context.project_folder, true);
		context.setLocalServerPath(local_folder);
		this._createRequireJSFile(local_folder);
	}

	_createRequireJSFile(local_folder) {
		const src = path.join(
			process.mainModule.filename,
			'../..',
			'node_modules',
			'requirejs',
			'require.js'
		);
		fs.copyFileSync(src, path.join(local_folder, 'require.js'));
	}
};
