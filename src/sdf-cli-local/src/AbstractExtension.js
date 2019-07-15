'use strict';

const Utils = require('./Utils');
const Log = require('./services/Log');
const FileSystem = require('./services/FileSystem');
const _ = require('underscore');
const path = require('path');
const url = require('url');

module.exports = class AbstractExtension {
	constructor(options) {
		const objects_path = options.objects_path;
		const extension_xml = options.extension_xml;

		this.raw_extension = Utils.parseXml(objects_path, extension_xml);
		this.base_url = 'http://localhost:7777'; // TODO remove and use cli-config
	}

	iterateResources(resources, func) {
		_.each(resources, (rsc, app) => {
			if (_.isString(rsc)) {
				func(Utils.parseFileName(rsc), app);
			} else {
				Utils.parseFiles(rsc).forEach(resource_path => {
					func(resource_path, app);
				});
			}
		});
	}

	getTemplates() {
		if (this.templates) {
			return this.templates;
		}
		this.templates = {};
		let templates = this.raw_extension.templates || {};
		templates = templates.application || {};

		this.iterateResources(templates, (resource_path, app) => {
			if (this.templates[resource_path]) {
				this.templates[resource_path].addApplication(app);
				return;
			}

			const file_format = '.js';
			this.templates[resource_path] = new Template({
				basesrc: this._excludeBasePath(resource_path),
				src: this._excludeBasePath(resource_path),
				dst: path.basename(resource_path) + file_format,
				name: path.basename(resource_path, path.extname(resource_path)),
				format: file_format,
				extension_asset_url: this.getAssetsUrl(),
				extension_fullname: this.getExtensionFullName('.'),
				app: app,
			});
		});

		if (!_.isEmpty(overrides)) {
			_.each(this.templates, (templates, app) => {
				_.each(templates, (template, index) => {
					const template_path = path.normalize(
						template.replace(this.base_path, this.name + '/')
					);
					const override = overrides[template_path] && overrides[template_path].src;

					if (override) {
						Log.default('OVERRIDE', [template, override]);
						templates[index] = override;
					}
				});
			});
		}

		return this.templates;
	}

	getSass() {
		if (this.sass) {
			return this.sass;
		}
		this.sass = {};

		let sass = this.raw_extension.sass || {};

		this.sass.files = Utils.parseFiles(sass);
		this.sass.entrypoints = _.mapObject(sass.entrypoints, entrypoint => {
			entrypoint = Utils.parseFileName(entrypoint);
			return this._excludeBasePath(entrypoint);
		});

		return this.sass;
	}

	_excludeBasePath(file) {
		return path.join(this.name, file.replace(new RegExp(`^${this.base_path}`), ''));
	}

	getExtensionFullName(separator = ' - ') {
		return [this.vendor, this.name, this.version].join(separator);
	}

	getLocalAssetsPath(folder = '') {
		return path.join(folder, this.getExtensionFullName('/'));
	}

	getAssetsUrl() {
		return FileSystem.forwardDashes(url.resolve(this.base_url, this.getLocalAssetsPath()));
	}

	getAssets() {
		if (this.assets) {
			return this.assets;
		}
		this.assets = [];
		const folder = 'assets';

		const ext_assets = this.raw_extension.assets || {};
		const assets_local_path = this.getLocalAssetsPath(folder);

		_.each(ext_assets, asset => {
			return Utils.parseFiles(asset, file => {
				const src = path.normalize(this._excludeBasePath(file));
				// first match of assets folder name and first match of extension name are removed from the dest path:
				const dest = path.join(
					assets_local_path,
					src.replace(folder, '').replace(this.name, '')
				);

				this.assets.push({ dest: dest, src: src });
			});
		});

		return this.assets;
	}
};
