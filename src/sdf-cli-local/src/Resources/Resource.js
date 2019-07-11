const _ = require('underscore');
const Utils = require('../Utils');
const path = require('path');
const Log = require('../services/Log');

let _basesrc = '';

module.exports = class Resource {
	constructor(options) {
		this.src = options.src;
		this.dst = options.dst;
		this.name = options.name;
		this.format = options.format || '';
		this.extension_assets_url = options.extension.getAssetsUrl();
		this.applications = _.flatten([options.app]);
		this.override_fullsrc;
		this.override;
	}

	addApplication(app) {
		this.applications = _.union(this.applications, [app]);
	}

	logOverrideMessage() {
		if (this.override) {
			Log.default('OVERRIDE', [this.src, this.override]);
		}
	}

	fullsrc() {
		return this.override_fullsrc || path.join(_basesrc, this.src);
	}

	fulldst() {
		return this.dst;
	}

	getBasename() {
		return path.basename(this.src);
	}

	getFilename() {
		return this.name + this.format;
	}

	static setBaseSrc(value) {
		_basesrc = value;
	}
};
