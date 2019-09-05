/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const AbstractExtension = require('./AbstractExtension');
const path = require('path');
const Script = require('./resources/types/Javascript');

module.exports = class Extension extends AbstractExtension {
	constructor(options) {
		super(options);

		this.PREFIX = 'commerceextension';
		this.rawExtension = this.rawExtension[this.PREFIX];

		this.basePath = this.rawExtension.basepath;
		this.vendor = this.rawExtension.vendor;
		this.name = this.rawExtension.name;
		this.version = this.rawExtension.version;
	}

	getJavascript() {
		if (this.javascript) {
			return this.javascript;
		}
		this.javascript = {};

		const javascript = this.rawExtension.javascript || {};
		const javascriptApp = javascript.application || {};
		const javascriptEntrypoints = javascript.entrypoints || {};

		Object.entries({ javascriptApp, javascriptEntrypoints }).forEach(([key, resources]) => {
			this.iterateResources(resources, (resourcePath, app) => {
				if (this.javascript[resourcePath]) {
					this.javascript[resourcePath].addApplication(app);
					return;
				}

				this.javascript[resourcePath] = new Script({
					src: this._excludeBasePath(resourcePath),
					dst: path.basename(resourcePath),
					name: path.basename(resourcePath, path.extname(resourcePath)),
					isEntrypoint: key === 'javascriptEntrypoints',
					extensionFullname: this.getExtensionFullName('#'),
					app: app,
				});
			});
		});

		return this.javascript;
	}
};
