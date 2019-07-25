/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const watch = require('node-watch');
const path = require('path');

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

			if (resource_type === 'sass' || resource_type === 'javascript') {
				compiler.compile();
			} else {
				this.context.all_extensions.forEach(extension => {
					for (const resource_path in extension[resource_type]) {
						const resource = extension[resource_type][resource_path];
						const filename_no_base = this.context.excludeBaseFilesPath(filename);

						if (path.normalize(resource_path).includes(filename_no_base)) {
							// compile one file
							compiler.compile([resource]);
						}
					}
				});
			}
		});
	}
};
