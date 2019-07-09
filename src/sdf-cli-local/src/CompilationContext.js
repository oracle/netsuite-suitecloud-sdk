'use strict';

const Theme = require('./Theme');
const Extension = require('./Extension');
const path = require('path');
const glob = require('glob').sync;

const _ = require('underscore');

const Resource = require('./Resources/Resource');

module.exports = class CompilationContext {
	constructor(options) {
		const objects_path = options.objects_path;
		const theme = options.theme;
		const extensions = options.extensions || [];

		this.files_path = options.files_path;
		this.project_folder = options.project_folder;

		Resource.setBaseSrc(this.files_path);

		this.theme = new Theme({ objects_path: objects_path, extension_xml: theme });

		this.extensions = _.map(extensions, extension => {
			return new Extension({ objects_path: objects_path, extension_xml: extension });
		});

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

	getTemplates(){	
		let templates = {};	
		this.all_extensions.map(extension => 
			templates = _.extend(templates, extension.getTemplates())
		);
		return this.handleOverrides(templates, this.getTplOverrides());
	}

	getSass() {
		let sass = {
			files: [],
			entrypoints: {},
		};

		_.each(this.all_extensions, extension => {
			const ext_sass = extension.getSass();
			const ext_assets_path = extension.getLocalAssetsPath('assets');

			_.each(ext_sass.entrypoints, (app_sass, app) => {
				sass.entrypoints[app] = sass.entrypoints[app] || [];
				sass.entrypoints[app].push({
					entry: app_sass,
					assets_path: ext_assets_path,
				});
			});

			sass.files = _.union(sass.files, ext_sass.files);
		});

		return sass;
	}

	getJavascript() {
		let javascript = {};	
		this.extensions.map(extension => // Change this map function.
			javascript = _.extend(javascript, extension.getJavascript())
		);
		return javascript;
	}

	getAssets() {
		let assets = {};
		const extensions = this.extensions.concat(this.theme);

		_.each(extensions, extension => {
			const ext_assets = extension.getAssets();
			assets = _.union(assets, ext_assets);
		});

		return assets;
	}

	excludeBaseFilesPath(dir) {
		return path.normalize(dir).replace(this.files_path, '');
	}

	handleOverrides(resources, overrides) {
		_.mapObject(resources, (resource)=>{
			const override = overrides[resource.src];
			if (override) {
				const full_path = glob(path.join(this.project_folder, '**', override.src));
				if (full_path.length) {
					resource.override_fullsrc = full_path[0];
					resource.override = override.src;
				}
			}
		})
		return resources;
	}
};
