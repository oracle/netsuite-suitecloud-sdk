'use strict';

const Theme = require('./Theme');
const Extension = require('./Extension');

const _ = require('underscore');

module.exports = class CompilationContext {

	constructor(options){
		const objects_path = options.objects_path;
		const theme = options.theme;
		const extensions = options.extensions || [];

		this.files_path = options.files_path;
		this.project_folder = options.project_folder;

		this.theme = new Theme({objects_path: objects_path, extension_xml: theme});

		this.extensions = _.map(extensions, (extension) => {
			return new Extension({objects_path: objects_path, extension_xml: extension});
		});
	}

	setLocalServerPath(path){
		this.local_server_path = path;
	}

	getTplOverrides(){
		return this.theme.getTplOverrides();
	}

	getSassOverrides(){
		return this.theme.getSassOverrides();
	}

	getTemplates(){
		let templates = {};
		const extensions = this.extensions.concat(this.theme);
		const overrides = this.getTplOverrides();

		_.each(extensions, (extension) => {
			const ext_templates = extension.getTemplates(overrides);

			templates =_.mapObject(ext_templates, (app_templates, app) => {
				return _.union(templates[app], app_templates);
			});
		});

		return templates;
	}

	getSass(){
		let sass = {
			files: [],
			entrypoints: {}
		};
		const extensions = [this.theme].concat(this.extensions);

		_.each(extensions, (extension) => {
			const ext_sass = extension.getSass();
			const ext_fullname = extension.getExtensionFullName();
			const ext_assets_path = extension.getLocalAssetsPath();

			_.each(ext_sass.entrypoints, (app_sass, app) => {
				sass.entrypoints[app] = sass.entrypoints[app] || {};
				sass.entrypoints[app][ext_fullname] = {
					entry: app_sass,
					path: ext_assets_path
				};
			});

			sass.files = _.union(sass.files, ext_sass.files);
		});

		return sass;
	}

	getJavascript(){
		let javascript = {
			applications: {},
			entrypoints: {}
		};
		const extensions = this.extensions;

		_.each(extensions, (extension) => {
			const ext_javascript = extension.getJavascript();

			_.each(ext_javascript.entrypoints, (app_javascript, app) => {
				javascript.entrypoints[app] = javascript.entrypoints[app] || [];
				javascript.entrypoints[app].push(app_javascript);
			});

			_.each(ext_javascript.applications, (app_javascript, app) => {
				javascript.applications[app] = javascript.applications[app] || [];
				javascript.applications[app] = _.union(javascript.applications[app], app_javascript);
			});
		});

		return javascript;
	}

	getAssets(){
		let assets = {};
		const extensions = this.extensions.concat(this.theme);

		_.each(extensions, (extension) => {
			const ext_assets = extension.getAssets();
			assets =_.extend(assets, ext_assets);
		});

		return assets;
	}

};
