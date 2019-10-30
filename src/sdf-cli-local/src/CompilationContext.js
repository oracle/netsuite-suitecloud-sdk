/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const Theme = require('./Theme');
const Extension = require('./Extension');
const path = require('path');
const glob = require('glob').sync;

const Utils = require('./Utils');

const Resource = require('./resources/Resource');

module.exports = class CompilationContext {
	constructor(options) {
		const objectsPath = options.objectsPath;
		const theme = options.theme;
		const extensions = options.extensions || [];

		this.filesPath = options.filesPath;
		this.projectFolder = options.projectFolder;

		Resource.setBaseSrc(this.filesPath);

		this.theme = new Theme({ objectsPath: objectsPath, extensionXml: theme });

		this.extensions = extensions.map(
			extension => new Extension({ objectsPath: objectsPath, extensionXml: extension })
		);

		this.allExtensions = [this.theme].concat(this.extensions);
	}

	setLocalServerPath(path) {
		this.localServerPath = path;
	}

	getTplOverrides() {
		return this.theme.getTplOverrides();
	}

	getSassOverrides() {
		return this.theme.getSassOverrides();
	}

	getTemplates() {
		let templates = {};
		this.allExtensions.forEach(
			extension => (templates = Object.assign(templates, extension.getTemplates()))
		);
		return this._handleOverrides(templates, this.getTplOverrides());
	}

	getSass() {
		const sass = {
			files: [],
			entrypoints: {},
		};

		this.allExtensions.forEach(extension => {
			const extSass = extension.getSass();
			const extAssetsPath = extension.getLocalAssetsPath('assets');

			for (const app in extSass.entrypoints) {
				const appSass = extSass.entrypoints[app];
				sass.entrypoints[app] = sass.entrypoints[app] || [];
				sass.entrypoints[app].push({
					entry: appSass,
					assetsPath: extAssetsPath,
				});
			}

			sass.files = Utils.arrayUnion(sass.files, extSass.files);
		});

		return sass;
	}

	getJavascript() {
		let javascript = {};
		this.extensions.forEach(
			extension => (javascript = Object.assign(javascript, extension.getJavascript()))
		);
		return javascript;
	}

	getAssets() {
		let assets = {};
		this.allExtensions.forEach(
			extension => (assets = Object.assign(assets, extension.getAssets()))
		);
		return assets;
	}

	excludeBaseFilesPath(dir) {
		return path.relative(this.filesPath, dir);
	}

	_handleOverrides(resources, overrides) {
		for (const resourcePath in resources) {
			const resource = resources[resourcePath];
			const override = overrides[resource.src];
			if (override) {
				const fullPath = glob(path.join(this.projectFolder, '**', override.src));
				if (fullPath.length) {
					resource.overrideFullsrc = fullPath[0];
					resource.override = override.src;
				}
			}
		}
		return resources;
	}
};
