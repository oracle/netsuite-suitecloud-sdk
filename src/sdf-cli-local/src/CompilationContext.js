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
		const objects_path = options.objects_path;
		const theme = options.theme;
		const extensions = options.extensions || [];

		this.files_path = options.files_path;
		this.project_folder = options.project_folder;

		Resource.setBaseSrc(this.files_path);

		this.theme = new Theme({ objects_path: objects_path, extension_xml: theme });

		this.extensions = extensions.map(
			extension => new Extension({ objects_path: objects_path, extension_xml: extension })
		);

		this.all_extensions = [this.theme].concat(this.extensions);
	}

	setLocalServerPath(path) {
		this.local_server_path = path;
	}

	getTplOverrides() {
		return this.theme.getTplOverrides();
	}

	getSassOverrides() {
		return this.theme.getSassOverrides();
	}

	getTemplates() {
		let templates = {};
		this.all_extensions.forEach(
			extension => (templates = Object.assign(templates, extension.getTemplates()))
		);
		return this._handleOverrides(templates, this.getTplOverrides());
	}

	getSass() {
		const sass = {
			files: [],
			entrypoints: {},
		};

		this.all_extensions.forEach(extension => {
			const ext_sass = extension.getSass();
			const ext_assets_path = extension.getLocalAssetsPath('assets');

			for (const app in ext_sass.entrypoints) {
				const app_sass = ext_sass.entrypoints[app];
				sass.entrypoints[app] = sass.entrypoints[app] || [];
				sass.entrypoints[app].push({
					entry: app_sass,
					assets_path: ext_assets_path,
				});
			}

			sass.files = Utils.arrayUnion(sass.files, ext_sass.files);
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
		this.all_extensions.forEach(
			extension => (assets = Object.assign(assets, extension.getAssets()))
		);
		return assets;
	}

	excludeBaseFilesPath(dir) {
		return path.relative(this.files_path, dir);
	}

	_handleOverrides(resources, overrides) {
		for (const resource_path in resources) {
			const resource = resources[resource_path];
			const override = overrides[resource.src];
			if (override) {
				const full_path = glob(path.join(this.project_folder, '**', override.src));
				if (full_path.length) {
					resource.override_fullsrc = full_path[0];
					resource.override = override.src;
				}
			}
		}
		return resources;
	}
};
