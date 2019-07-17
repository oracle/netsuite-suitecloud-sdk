'use strict';

const handlebars = require('handlebars');
const _ = require('underscore');
const Utils = require('../Utils');
const fs = require('fs');
const url = require('url');
const path = require('path');
const Log = require('../services/Log');
const FileSystem = require('../services/FileSystem');

module.exports = class TemplatesCompiler {
	constructor(options) {
		this.context = options.context;
		this.entrypoints = {};
		this.resource_type = 'Templates';
		this.templates_folder = 'templates';
		this.processed_templates_folder = 'processed-templates';
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resource_type]);

		this.templates = resources || this.context.getTemplates();

		this.createTemplateFolders();

		this.setCompilerNameLookupHelper();
		// new file with template helpers:
		this.writeJavascriptLibsFile();

		// first create templates files
		const templates = this.writeTemplates();
		return Utils.runParallel(_.flatten(templates)).then(() => {
			// then create require.js config files
			const entrypoints = this.writeEntrypoints();
			return Utils.runParallel(entrypoints).then(() =>
				Log.result('COMPILATION_FINISH', [this.resource_type])
			);
		});
	}

	writeTemplate(template) {
		return () =>
			//read original template file:
			template.sourceContent().then(content => {
				template.setPrecomplied(handlebars.precompile(content));

				template.applications.forEach(app => {
					const basename = template.getBasename();
					this.entrypoints[app] = this.entrypoints[app] || {};
					this.entrypoints[app][basename] = basename;
				});

				//write final template file:
				template.logOverrideMessage();
				return FileSystem.writeFile(
					path.join(this.processed_templates_path, template.dst),
					this.wrapTemplate(template)
				);
			});
	}

	writeTemplates() {
		return _.map(this.templates, template => this.writeTemplate(template));
	}

	writeEntrypoints() {
		return ['checkout', 'shopping', 'myaccount'].map(app => {
			const dest = path.join(this.templates_path, `${app}-templates.js`);
			const entryfile_content = {
				paths: this.entrypoints[app],
				baseUrl: url.resolve(
					'http://localhost:7777/',
					`${this.templates_folder}/${this.processed_templates_folder}`
				),
				// TODO remove and use cli-config
			};

			return () => FileSystem.writeFile(dest, this.wrapEntrypoint(entryfile_content));
		});
	}

	wrapEntrypoint(entrypoint) {
		return `require.config(${JSON.stringify(entrypoint, null, 2)})`;
	}

	wrapTemplate(template) {
		return `define('${template.getFilename()}', [${template
			.getDependencies()
			.join()}], function (Handlebars, compilerNameLookup){ var t = ${
			template.precompiled
		}; var main = t.main; t.main = function(){ arguments[1] = arguments[1] || {}; var ctx = arguments[1]; ctx._extension_path = '${
			template.extension_asset_url
		}'; ctx._theme_path = '${this.context.theme.getAssetsUrl()}'; return main.apply(this, arguments); }; var template = Handlebars.template(t); template.Name = '${
			template.name
		}'; return template;});`;
	}

	writeJavascriptLibsFile() {
		// create javascript-libs.js
		let content = '';
		['loadTemplateSafe', 'Handlebars.CompilerNameLookup'].map(filename => {
			content += fs
				.readFileSync(
					path.join(
						process.mainModule.filename,
						'../../src/sdf-cli-local/src/client-scripts',
						filename + '.js'
					)
				)
				.toString();
		});
		fs.writeFileSync(path.join(this.templates_path, 'javascript-libs.js'), content);
	}

	setCompilerNameLookupHelper() {
		handlebars.JavaScriptCompiler.prototype.nameLookup = (parent, name) =>
			`compilerNameLookup(${parent},"${name}")`;
	}

	createTemplateFolders() {
		this.templates_path = FileSystem.createFolder(
			this.templates_folder,
			this.context.local_server_path
		);
		this.processed_templates_path = FileSystem.createFolder(
			this.processed_templates_folder,
			this.templates_path
		);
	}
};
