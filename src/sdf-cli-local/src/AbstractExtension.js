'use strict';

const Utils = require('./Utils');
const Log = require('./services/Log');
const _ = require('underscore');
const path = require('path');

module.exports = class AbstractExtension {

	constructor(options){
		const objects_path = options.objects_path;
		const extension_xml = options.extension_xml;

		this.raw_extension = Utils.parseXml(objects_path, extension_xml);
	}

	getTemplates(overrides = {}){
		if(this.templates){
			return this.templates;
		}
		this.templates = {};

		let templates = this.raw_extension.templates || {};
		templates = templates.application || {};

		_.each(templates, (tpl, app) => {
			this.templates[app] = Utils.parseFiles(tpl);
		});

		if(!_.isEmpty(overrides)){
			_.each(this.templates, (templates, app) => {
				_.each(templates, (template, index) => {
					const template_path = path.normalize(template.replace(this.base_path, this.name + '/'));
					const override = overrides[template_path] && overrides[template_path].src;

					if(override){
						Log.default('OVERRIDE', [template, override]);
						templates[index] = override;
					}
				});
			});
		}

		return this.templates;
	}

	getSass(){
		if(this.sass) {
			return this.sass;
		}
		this.sass = {};

		let sass = this.raw_extension.sass || {};

		this.sass.files = Utils.parseFiles(sass);
		this.sass.entrypoints = _.mapObject(sass.entrypoints, (entrypoint) => {
			entrypoint = Utils.parseFileName(entrypoint);
			entrypoint = entrypoint.replace(new RegExp(`^${this.base_path}`), '');
			return path.join(this.name, entrypoint);
		});

		return this.sass;
	}

	getAssets(){
		if(this.assets) {
			return this.assets;
		}
		this.assets = {};

		const ext_assets = this.raw_extension.assets || {};

		this.assets = _.map(ext_assets, Utils.parseFiles);
		this.assets = _.flatten(this.assets);

		return this.assets;
	}
};
