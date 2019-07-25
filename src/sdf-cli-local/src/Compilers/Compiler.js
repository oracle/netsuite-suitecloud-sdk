'use strict';

const SassCompiler = require('./SassCompiler');
const TemplatesCompiler = require('./TemplatesCompiler');
const JavascriptCompiler = require('./JavascriptCompiler');
const AssetsCompiler = require('./AssetsCompiler');

const fs = require('fs');
const path = require('path');

const Utils = require('../Utils');
const FileSystem = require('../services/FileSystem');
const _ = require('underscore');

module.exports = class Compiler {
	constructor(options) {
		this.context = options.context;
	}

	compile() {
		this._createLocalServerFolder(this.context);

		const compilers = [
			new SassCompiler({ context: this.context }),
			// new TemplatesCompiler({context: this.context}),
			// new JavascriptCompiler({context: this.context}),
			new AssetsCompiler({ context: this.context }),
		];

		const binded_compilers = _.map(compilers, compiler => _.bind(compiler.compile, compiler));
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
