/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
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

		let objectsPath = this.deploy.objects.path;
		objectsPath = path.join(this._projectFolder, objectsPath.substr(1));
		this.objectsPath = path.dirname(objectsPath);

		let filesPath = this.deploy.files.path;
		filesPath = path.join(this._projectFolder, filesPath.substr(1));
		this.filesPath = path.dirname(filesPath);
	}

	getObjects() {
		if (this.objects) {
			return this.objects;
		}

		const path = require('path');
		const glob = require('glob').sync;
		const objectsPath = glob(path.join(this.objectsPath, '*'));

		this.objects = {
			extensions: {},
			themes: {},
		};
		objectsPath.forEach(objectPath => {
			const name = path.basename(objectPath);

			if (/^custcommerceextension/.test(name)) {
				this.objects.extensions[name] = objectPath;
			} else if (/^custcommercetheme/.test(name)) {
				this.objects.themes[name] = objectPath;
			}
		});
		return this.objects;
	}
};
