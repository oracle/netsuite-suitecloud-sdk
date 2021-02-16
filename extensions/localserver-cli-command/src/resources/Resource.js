/*
** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
const path = require('path');
const Log = require('../services/Log');
const FileSystem = require('../services/FileSystem');

let _basesrc = '';

module.exports = class Resource {
	constructor(options) {
		this.src = options.src;
		this.dst = options.dst;
		this.name = options.name || '';
		this.content = '';
		this.applications = [options.app];
		this.overrideFullsrc;
		this.override;
	}

	async sourceContent() {
		return (this.content = await FileSystem.getFileContent(this.fullsrc()));
	}

	addApplication(app) {
		if (!this.applications.includes(app)) {
			this.applications.push(app);
		}
	}

	logOverrideMessage() {
		if (this.override) {
			Log.default('OVERRIDE', [FileSystem.forwardDashes(this.src), this.override]);
		}
	}

	fullsrc() {
		return this.overrideFullsrc || path.join(_basesrc, this.src);
	}

	fulldst() {
		return this.dst;
	}

	getBasename() {
		return path.basename(this.src);
	}

	getFilename() {
		return this.name + (this.format || '');
	}

	static setBaseSrc(value) {
		_basesrc = value;
	}
};
