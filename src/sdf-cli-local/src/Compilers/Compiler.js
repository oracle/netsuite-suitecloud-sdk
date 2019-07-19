/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const SassCompiler = require('./SassCompiler');
const AssetsCompiler = require('./AssetsCompiler');

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
	}
};
