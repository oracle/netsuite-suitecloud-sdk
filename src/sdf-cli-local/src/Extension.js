'use strict';

const AbstractExtension = require('./AbstractExtension');
const Utils = require('./Utils');
const _ = require('underscore');
const path = require('path');
const Script = require('./Resources/Types/Javascript');

module.exports = class Extension extends AbstractExtension {
	constructor(options) {
		super(options);

		this.PREFIX = 'commerceextension';
		this.raw_extension = this.raw_extension[this.PREFIX];

		this.base_path = this.raw_extension.basepath;
		this.vendor = this.raw_extension.vendor;
		this.name = this.raw_extension.name;
		this.version = this.raw_extension.version;
	}

	getJavascript() {
		if (this.javascript) {
			return this.javascript;
		}
		this.javascript = {};

		const javascript = this.raw_extension.javascript || {};
		const javascript_app = javascript.application || {};
		const javascript_entrypoints = javascript.entrypoints || {};

		_.each({ javascript_app, javascript_entrypoints }, (resources, key) => {
			this.iterateResources(resources, (resource_path, app) => {
				if (this.javascript[resource_path]) {
					this.javascript[resource_path].addApplication(app);
					return;
				}

				this.javascript[resource_path] = new Script({
					basesrc: this._excludeBasePath(resource_path),
					src: this._excludeBasePath(resource_path),
					dst: path.basename(resource_path),
					name: path.basename(resource_path, path.extname(resource_path)),
					isEntrypoint: key === 'javascript_entrypoints',
					extension_asset_url: this.getAssetsUrl(),
					extension_fullname: this.getExtensionFullName('.'),
					app: app,
				});
			});
		});

		return this.javascript;
	}
};
