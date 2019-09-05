/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const handlebars = require('handlebars');
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
		this.resourceType = 'Templates';
		this.templatesFolder = 'templates';
		this.processedTemplatesFolder = 'processed-templates';
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resourceType]);

		this.templates = resources || this.context.getTemplates();

		this._createTemplateFolders();

		this._setCompilerNameLookupHelper();
		// new file with template helpers:
		this._writeJavascriptLibsFile();

		// first create templates files
		const templates = this._writeTemplates();
		return Utils.runParallel(templates).then(() => {
			// then create require.js config files
			const entrypoints = this._writeEntrypoints();
			return Utils.runParallel(entrypoints).then(() =>
				Log.result('COMPILATION_FINISH', [this.resourceType])
			);
		});
	}

	_writeTemplate(template) {
		return () =>
			//read original template file:
			template.sourceContent().then(content => {
				template.setPrecompiled(handlebars.precompile(content));

				template.applications.forEach(app => {
					const basename = template.getBasename();
					this.entrypoints[app] = this.entrypoints[app] || {};
					this.entrypoints[app][basename] = basename;
				});

				//write final template file:
				template.logOverrideMessage();
				return FileSystem.writeFile(
					path.join(this.processedTemplatesPath, template.dst),
					this._wrapTemplate(template)
				);
			});
	}

	_writeTemplates() {
		const promises = [];
		for (const templatePath in this.templates) {
			promises.push(this._writeTemplate(this.templates[templatePath]));
		}
		return promises;
	}

	_writeEntrypoints() {
		const promises = [];
		for (const app in this.entrypoints) {
			const dest = path.join(this.templatesPath, `${app}-templates.js`);
			const entryfileContent = {
				paths: this.entrypoints[app],
				baseUrl: url.resolve(
					'http://localhost:7777/',
					`${this.templatesFolder}/${this.processedTemplatesFolder}`
				),
				// TODO remove and use cli-config
			};

			promises.push(() => FileSystem.writeFile(dest, this._wrapEntrypoint(entryfileContent)));
		}
		return promises;
	}

	_wrapEntrypoint(entrypoint) {
		return `require.config(${JSON.stringify(entrypoint, null, 2)})`;
	}

	_wrapTemplate(template) {
		return `define('${template.getFilename()}', [${template
			.getDependencies()
			.join()}], function (Handlebars, compilerNameLookup){ var t = ${
			template.precompiled
		}; var main = t.main; t.main = function(){ arguments[1] = arguments[1] || {}; var ctx = arguments[1]; ctx._extension_path = '${
			template.extensionAssetUrl
		}/'; ctx._theme_path = '${this.context.theme.getAssetsUrl()}/'; return main.apply(this, arguments); }; var template = Handlebars.template(t); template.Name = '${
			template.name
		}'; return template;});`;
	}

	_writeJavascriptLibsFile() {
		// create javascript-libs.js
		let content = '';
		['loadTemplateSafe', 'Handlebars.CompilerNameLookup'].map(filename => {
			content += fs
				.readFileSync(path.join(__dirname, '../../src/client-scripts', filename + '.js'))
				.toString();
		});
		fs.writeFileSync(path.join(this.templatesPath, 'javascript-libs.js'), content);
	}

	_setCompilerNameLookupHelper() {
		handlebars.JavaScriptCompiler.prototype.nameLookup = (parent, name) =>
			`compilerNameLookup(${parent},"${name}")`;
	}

	_createTemplateFolders() {
		this.templatesPath = FileSystem.createFolder(
			this.templatesFolder,
			this.context.localServerPath
		);
		this.processedTemplatesPath = FileSystem.createFolder(
			this.processedTemplatesFolder,
			this.templatesPath
		);
	}
};
