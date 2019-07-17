'use strict';

const watch = require('node-watch');
const Log = require('./services/Log');
const path = require('path');
const _ = require('underscore');

module.exports = class Watch {
	constructor(options) {
		this.context = options.context;
		this.compilers = options.compilers;
	}

	start() {
		watch(this.context.files_path, { recursive: true }, (evtname, filename) => {
			const extname = path.extname(filename).slice(1);

			const filemap = {
				tpl: this.compilers.templates,
				js: this.compilers.javascript,
				scss: this.compilers.sass,
			};

			const compiler = filemap[extname] || this.compilers.assets;

			const resource_type = compiler.resource_type.toLowerCase();

			if (resource_type === 'sass') {
				compiler.compile();
			} else {
				this.context.all_extensions.forEach(extension => {
					_.each(extension[resource_type], (template, key) => {
						const filename_no_base = this.context.excludeBaseFilesPath(filename);

						if (path.normalize(key).includes(filename_no_base)) {
							compiler.compile([template]);
							Log.result('COMPILATION_START_FOR', [
								compiler.resource_type,
								path.basename(filename),
							]);
						}
					});
				});
			}
		});
	}
};
