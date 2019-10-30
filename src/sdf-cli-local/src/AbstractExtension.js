/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const Utils = require('./Utils');
const FileSystem = require('./services/FileSystem');
const LocalServer = require('./LocalServer');
const path = require('path');
const url = require('url');

const Template = require('./resources/types/Template');
const Resource = require('./resources/Resource');

module.exports = class AbstractExtension {
	constructor(options) {
		const objectsPath = options.objectsPath;
		const extensionXml = options.extensionXml;

		this.rawExtension = Utils.parseXml(objectsPath, extensionXml);
	}

	iterateResources(resources, func) {
		for (const app in resources) {
			const rsc = resources[app];
			if (typeof rsc === 'string') {
				func(Utils.parseFileName(rsc), app);
			} else {
				Utils.parseFiles(rsc).forEach(resourcePath => {
					func(resourcePath, app);
				});
			}
		}
	}

	getTemplates() {
		if (this.templates) {
			return this.templates;
		}
		this.templates = {};
		let templates = this.rawExtension.templates || {};
		templates = templates.application || {};

		this.iterateResources(templates, (resourcePath, app) => {
			if (this.templates[resourcePath]) {
				this.templates[resourcePath].addApplication(app);
				return;
			}

			this.templates[resourcePath] = new Template({
				basesrc: this._excludeBasePath(resourcePath),
				src: this._excludeBasePath(resourcePath),
				dst: path.basename(resourcePath) + '.js',
				name: path.basename(resourcePath, path.extname(resourcePath)),
				extensionAssetUrl: this.getAssetsUrl(),
				app: app,
			});
		});

		return this.templates;
	}

	getSass() {
		if (this.sass) {
			return this.sass;
		}
		this.sass = {};

		const sass = this.rawExtension.sass || {};

		this.sass.files = Utils.parseFiles(sass);
		this.sass.entrypoints = {};
		for (const app in sass.entrypoints) {
			const entrypoint = Utils.parseFileName(sass.entrypoints[app]);
			this.sass.entrypoints[app] = this._excludeBasePath(entrypoint);
		}

		return this.sass;
	}

	_excludeBasePath(file) {
		return path.join(this.name, file.replace(new RegExp(`^${this.basePath}`), ''));
	}

	getExtensionFullName(separator = ' - ') {
		return [this.vendor, this.name, this.version].join(separator);
	}

	getLocalAssetsPath(folder = '') {
		return path.join(folder, this.getExtensionFullName('/'));
	}

	getAssetsUrl() {
		return FileSystem.forwardDashes(
			url.resolve(LocalServer.serverUrl(), `assets/${this.getLocalAssetsPath()}`)
		);
	}

	getAssets() {
		if (this.assets) {
			return this.assets;
		}
		this.assets = {};
		const folder = 'assets';

		const extAssets = this.rawExtension.assets || {};
		const assetsLocalPath = this.getLocalAssetsPath(folder);

		this.iterateResources(extAssets, (resourcePath, type) => {
			const src = path.normalize(this._excludeBasePath(resourcePath));
			// first match of assets folder name and first match of extension name are removed from the dest path:
			const dst = path.join(assetsLocalPath, src.replace(folder, '').replace(this.name, ''));

			this.assets[resourcePath] = new Resource({ src, dst });
		});
		return this.assets;
	}
};
