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
		this.templates_list = {};
		this.entrypoints = {};
		this.template_extension = '.js';
		this.resource_type = 'Templates';
		this.templates_folder = 'templates';
		this.processed_templates_folder = 'processed-templates';
		this.overrides = this.context.getTplOverrides();
	}

	compile(file) {
		Log.result('COMPILATION_START', [this.resource_type]);

		this.createTemplateFolders();

		// Uncomment for watch task:
		// if (file) {
		// 	return Utils.runParallel([
		// 		this.writeTemplate(
		// 			this.context.excludeBaseFilesPath(file),
		// 			this.context.getExtensionByFile(file)
		// 		),
		// 	]);
		// }

		this.setCompilerNameLookupHelper();
		const extensions = this.context.getAllExtensions();

		// first create templates files
		const templates = extensions.map(_.bind(this.writeTemplates, this));
		return Utils.runParallel(_.flatten(templates)).then(() => {
			// then create require.js config files
			const entrypoints = extensions.map(_.bind(this.writeEntrypoints, this));
			return Utils.runParallel(_.flatten(entrypoints)).then(() =>
				Log.result('COMPILATION_FINISH', [this.resource_type])
			);
		});
	}

	writeTemplate(template, extension) {
		//paths:
		const source_path = this.handleOverride(template);
		const template_name = path.basename(template);
		const dest_path = path.join(
			this.processed_templates_path,
			template_name + this.template_extension
		);

		return () =>
			//read original template file:
			Utils.getFileContent(source_path).then(template_source_content => {
				const precompiled = handlebars.precompile(template_source_content);
				const content = this.wrapTemplate({
					name: template_name,
					original_content: template_source_content,
					precompiled_content: precompiled,
					extension_url: extension.getAssetsUrl(),
				});

				//write final template file:
				return (
					this.addToTemplatesList(template_name) && Utils.writeFile(dest_path, content)
				);
			});
	}

	addToTemplatesList(template_name) {
		if (!this.context.isWatch && this.templates_list[template_name]) {
			return false;
		}
		return (this.templates_list[template_name] = Utils.forwardSlashes(
			path.join(this.processed_templates_folder, template_name)
		));
	}

	writeTemplates(extension) {
		const resources = extension.getTemplatesFlatted();

		return _.map(resources, template => this.writeTemplate(template, extension));
	}

	writeEntrypoints(extension) {
		const resources = extension.getTemplates();

		return _.map(resources, (templates, app) => {
			_.each(templates, template => {
				template = path.basename(template);
				this.entrypoints[app] = this.entrypoints[app] || {};
				this.entrypoints[app][template] = this.templates_list[template];
			});

			const dest = path.join(
				this.templates_path,
				`${app}-templates${this.template_extension}`
			);
			const entryfile_content = {
				paths: this.entrypoints[app],
				baseUrl: extension.base_url,
			};

			return () => Utils.writeFile(dest, this.wrapEntrypoint(entryfile_content));
		});
	}

	wrapEntrypoint(entrypoint) {
		return `require.config(${JSON.stringify(entrypoint, null, 2)})`;
	}

	wrapTemplate(template) {
		const extension_path = template.extension_url;
		const theme_path = this.context.theme.getAssetsUrl();
		const template_name = path.basename(template.name, path.extname(template.name));
		const dependencies = this.getDependencies(template.original_content).join();

		return `define('${
			template.name
		}', [${dependencies}], function (Handlebars, compilerNameLookup){ var t = ${
			template.precompiled_content
		}; var main = t.main; t.main = function(){ arguments[1] = arguments[1] || {}; var ctx = arguments[1]; ctx._extension_path = '${extension_path}'; ctx._theme_path = '${theme_path}'; return main.apply(this, arguments); }; var template = Handlebars.template(t); template.Name = '${template_name}'; return template;});`;
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
