/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class DeployXml {
	constructor(options) {
		this._projectFolder = options.projectFolder;
		this.initialize();
	}

	initialize() {
		const path = require('path');
		const Utils = require('./Utils');

		this.deploy = Utils.parseXml(this._projectFolder, 'deploy.xml').deploy;

		let objects_path = this.deploy.objects.path;
		objects_path = path.join(this._projectFolder, objects_path.substr(1));
		this.objects_path = path.dirname(objects_path);

		let files_path = this.deploy.files.path;
		files_path = path.join(this._projectFolder, files_path.substr(1));
		this.files_path = path.dirname(files_path);
	}

	getObjects() {
		if (this.objects) {
			return this.objects;
		}

		const path = require('path');
		const glob = require('glob').sync;
		const _ = require('underscore');
		const objects_path = glob(path.join(this.objects_path, '*'));

		this.objects = {
			extensions: {},
			themes: {},
		};
		_.each(objects_path, object_path => {
			const name = path.basename(object_path);

			if (/^custcommerceextension/.test(name)) {
				this.objects.extensions[name] = object_path;
			} else if (/^custcommercetheme/.test(name)) {
				this.objects.themes[name] = object_path;
			}
		});
		return this.objects;
	}
};
