'use strict';

const SassCompiler = require('./SassCompiler');
const TemplatesCompiler = require('./TemplatesCompiler');
const JavascriptCompiler = require('./JavascriptCompiler');
const AssetsCompiler = require('./AssetsCompiler');

const Utils = require('../Utils');
const _ = require('underscore');

module.exports = class Compiler {
	constructor(options) {
		this.context = options.context;
	}

	compile() {
		this._createLocalServerFolder(this.context);

		const compilers = [
			new SassCompiler({ context: this.context }),
			new TemplatesCompiler({ context: this.context }),
			// new JavascriptCompiler({context: this.context}),
			// new AssetsCompiler({context: this.context}),
		];

		const binded_compilers = _.map(compilers, compiler => _.bind(compiler.compile, compiler));
		return Utils.runParallel(binded_compilers);
	}

	_createLocalServerFolder(context) {
		const local_folder = Utils.createFolder('LocalServer', context.project_folder);
		context.setLocalServerPath(local_folder);
	}
};
