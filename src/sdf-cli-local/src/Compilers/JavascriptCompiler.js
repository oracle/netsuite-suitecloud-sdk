'use strict';

const Utils = require('../Utils');
const Log = require('../services/Log');
const path = require('path');
const _ = require('underscore');
const FileSystem = require('../services/FileSystem');

module.exports = class JavascriptCompiler {
	constructor(options) {
		this.context = options.context;
		this.resource_type = 'Javascript';
	}

	createFolder() {
		this.js_path = FileSystem.createFolder('javascript', this.context.local_server_path);
	}

	async compile(resources = this.context.getJavascript()) {
		Log.result('COMPILATION_START', [this.resource_type]);
		this.createFolder();
		return Utils.runParallel(await this.createFiles(resources)).then(() => {
			Log.result('COMPILATION_FINISH', [this.resource_type]);
		});
	}

	async createFiles(resources) {
		/**
		 * The {app}_ext.js generated file content will be like:
		 *	`var extensions = {};`
		 *	`javascript_modules`
		 *	`last javascript must be the entrypoint`
		 *	`content_at_the_end (call methods in javascript_modules)`
		 */
		const application_files = {
			checkout: { javascript_modules: {}, content_at_the_end: '' },
			shopping: { javascript_modules: {}, content_at_the_end: '' },
			myaccount: { javascript_modules: {}, content_at_the_end: '' },
		};

		await Promise.all(
			_.map(resources, resource =>
				// read all files content:
				resource.sourceContent().then(content => {
					// then add the file content on each application_file
					resource.applications.forEach(app_name => {
						const ext_name = resource.extension_fullname;
						const app_file = application_files[app_name];
						app_file.javascript_modules[ext_name] =
							app_file.javascript_modules[ext_name] || '';
						// if it is an entrypoint, append to the end
						// also add a try catch block that call SC.addExtensionModule
						if (resource.isEntrypoint) {
							app_file.content_at_the_end += this.createTryCatchBlock(
								resource.name,
								resource.extension_fullname
							);
							app_file.javascript_modules[ext_name] += content;
						} else {
							// if it is not an entrypoint, append first
							app_file.javascript_modules[ext_name] =
								content + app_file.javascript_modules[ext_name];
						}
					});
				})
			)
		);

		return _.map(application_files, (application_file, app_name) => {
			const content = `
				var extensions = {};
				${_.map(application_file.javascript_modules, this.createModuleBlock).join('')}
				${application_file.content_at_the_end}
			`;
			const dest = path.join(this.js_path, `${app_name}_ext.js`);
			// define content and dest and write file.
			return () => FileSystem.writeFile(dest, content);
		});
	}

	createModuleBlock(content, ext_name) {
		return `
		extensions["${ext_name}"] = function() {			
			function getExtensionAssetsPath(asset){
				return 'extensions/${ext_name.replace(/#/g, '/')}' + asset;
			}
			${content}
		};`;
	}

	createTryCatchBlock(entrypoint, ext_name) {
		return `
		try {
			extensions['${ext_name}']();
			SC.addExtensionModule('${entrypoint}');
		}
		catch(error)
		{
			console.error(error);
		}`;
	}
};
