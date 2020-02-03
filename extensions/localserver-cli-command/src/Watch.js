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
		watch(this.context.filesPath, { recursive: true }, (evtname, filename) => {
			const extname = path.extname(filename).slice(1);

			const filemap = {
				tpl: this.compilers.templates,
				js: this.compilers.javascript,
				scss: this.compilers.sass,
			};

			const compiler = filemap[extname] || this.compilers.assets;

			const resourceType = compiler.resourceType.toLowerCase();

			if (resourceType === 'sass' || resourceType === 'javascript') {
				compiler.compile();
			} else {
				this.context.allExtensions.forEach(extension => {
					for (const resourcePath in extension[resourceType]) {
						const resource = extension[resourceType][resourcePath];
						const filenameNoBase = this.context.excludeBaseFilesPath(filename);
						if (path.normalize(resourcePath).includes(filenameNoBase)) {
							// compile one file
							compiler.compile([resource]);
						}
					}
				});
			}
		});
	}
};
