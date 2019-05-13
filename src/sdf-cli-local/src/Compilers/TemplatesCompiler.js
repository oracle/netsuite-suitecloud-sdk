'use strict';

const handlebars = require('handlebars');
const _ = require('underscore');
const Utils = require('../Utils');
const path = require('path');
const glob = require('glob').sync;
const Log = require('../services/Log');

module.exports = class TemplatesCompiler {
	constructor(options) {
		this.context = options.context;
		this.templates = {};
		this.entrypoints = {};
		this.template_extension = '.js';
		this.resource_type = 'Templates';
		this.templates_folder = 'templates';
		this.processed_templates_folder = 'processed-templates';
		this.overrides = this.context.getTplOverrides();
		this.baseUrl = 'http://localhost:7777'; // TODO replace with cli-config
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resource_type]);

		this.createTemplateFolders();
		this.setCompilerNameLookupHelper();

		resources = resources || this.context.getTemplates();

		return Utils.runParallel(this.writeTemplates(resources.files)).then(() => {
			Utils.runParallel(this.writeEntrypoints(resources.entrypoints)).then(() => {
				Log.result('COMPILATION_FINISH', [this.resource_type]);
			});
		});
	}

	writeTemplates(resources) {
		return _.map(resources, (extension, template) => {
			const source_path = this.handleOverride(template);
			const template_name = path.basename(template);
			const dest_path = path.join(
				this.processed_templates_path,
				template_name + this.template_extension
			);

			return () =>
				Utils.getFileContent(source_path, template).then(template_source_content => {
					const precompiled = handlebars.precompile(template_source_content);
					const content = this.wrapTemplate(
						template_source_content,
						precompiled,
						template_name,
						extension
					);

					if (this.templates[template_name]) {
						return;
					}

					this.templates[template_name] = Utils.forwardSlashes(
						path.join(this.processed_templates_folder, template_name)
					);

					return Utils.writeFile(dest_path, content);
				});
		});
	}

	writeEntrypoints(resources) {
		return _.map(resources, (templates, app) => {
			_.each(templates, template => {
				template = path.basename(template);
				this.entrypoints[app] = this.entrypoints[app] || {};
				this.entrypoints[app][template] = this.templates[template];
			});

			const dest = path.join(
				this.templates_path,
				`${app}-templates${this.template_extension}`
			);
			const entryfile_content = {
				paths: this.entrypoints[app],
				baseUrl: this.baseUrl,
			};

			return () => Utils.writeFile(dest, this.wrapEntrypoint(entryfile_content));
		});
	}

	wrapEntrypoint(entrypoint) {
		return `require.config(${JSON.stringify(entrypoint, null, 2)})`;
	}

	wrapTemplate(template, precompiled, module_name, extension) {
		const extension_path = Utils.forwardSlashes(path.join(this.baseUrl, extension));
		const theme_path = Utils.forwardSlashes(
			path.join(this.baseUrl, this.context.theme.getLocalAssetsPath())
		);
		const template_name = path.basename(module_name, path.extname(module_name));
		const dependencies = this.getDependencies(template).join();

		return `define('${module_name}', [${dependencies}], function (Handlebars, compilerNameLookup){ var t = ${precompiled}; var main = t.main; t.main = function(){ arguments[1] = arguments[1] || {}; var ctx = arguments[1]; ctx._extension_path = '${extension_path}'; ctx._theme_path = '${theme_path}'; return main.apply(this, arguments); }; var template = Handlebars.template(t); template.Name = '${template_name}'; return template;});`;
	}

	handleOverride(file) {
		const override = this.overrides[file];
		if (override) {
			Log.default('OVERRIDE', [file, override.src]);
			const full_path = glob(path.join(this.context.project_folder, '**', override.src));
			if (full_path.length) {
				return full_path[0];
			}
		}
		return path.join(this.context.files_path, file);
	}

	getDependencies(template) {
		const regex = /data-\w*\-{0,1}template=\"([^"]+)\"/gm;
		const dependencies = [`'Handlebars'`, `'Handlebars.CompilerNameLookup'`];
		let result;

		while ((result = regex.exec(template))) {
			dependencies.push(`'${result[1]}.tpl'`);
		}
		return _.uniq(dependencies);
	}

	setCompilerNameLookupHelper() {
		handlebars.JavaScriptCompiler.prototype.nameLookup = (parent, name) =>
			`compilerNameLookup(${parent},"${name}")`;
	}

	createTemplateFolders() {
		this.templates_path = Utils.createFolder(
			this.templates_folder,
			this.context.local_server_path
		);
		this.processed_templates_path = Utils.createFolder(
			this.processed_templates_folder,
			this.templates_path
		);
	}
};
