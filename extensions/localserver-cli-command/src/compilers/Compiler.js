/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
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

		const bindedCompilers = [];
		for (const name in this.compilers) {
			const compiler = this.compilers[name];
			bindedCompilers.push(compiler.compile.bind(compiler));
		}
		return Utils.runParallel(bindedCompilers);
	}

	_createLocalServerFolder(context) {
		const serverFolder = 'LocalServer';
		// create/override local server:
		const localFolder = FileSystem.createFolder(serverFolder, context.projectFolder, true);
		context.setLocalServerPath(localFolder);
		this._createRequireJSFile(localFolder);
	}

	_createRequireJSFile(localFolder) {
		const src = require.resolve('requirejs');
		const dst = path.join(localFolder, 'require.js');
		fs.copyFileSync(src, dst);

		let content = fs.readFileSync(dst).toString();
		content = content.replace('#!/usr/bin/env node', '');
		fs.writeFileSync(dst, content);
	}
};
