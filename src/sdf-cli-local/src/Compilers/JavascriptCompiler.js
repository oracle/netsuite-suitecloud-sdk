/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const Utils = require('../Utils');
const Log = require('../services/Log');
const path = require('path');
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

		const read_files_promises = [];
		for (const resource_path in resources) {
			const resource = resources[resource_path];
			read_files_promises.push(
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
			);
		}

		await Promise.all(read_files_promises);

		const write_files_promises = [];

		for (const app_name in application_files) {
			const application_file = application_files[app_name];
			// javascript modules content:
			const javascript_modules = [];
			for (const ext_name in application_file.javascript_modules) {
				javascript_modules.push(
					this.createModuleBlock(application_file.javascript_modules[ext_name], ext_name)
				);
			}
			// define full content and dest and write file.
			const content = `
				var extensions = {};
				${javascript_modules.join('')}
				${application_file.content_at_the_end}
			`;
			const dest = path.join(this.js_path, `${app_name}_ext.js`);
			write_files_promises.push(() => FileSystem.writeFile(dest, content));
		}
		return write_files_promises;
	}

	createModuleBlock(content, ext_name) {
		return `
		extensions["${ext_name.replace(/#/g, '.')}"] = function() {			
			function getExtensionAssetsPath(asset){
				return 'assets/${ext_name.replace(/#/g, '/')}/' + asset;
			}
			${content}
		};`;
	}

	createTryCatchBlock(entrypoint, ext_name) {
		return `
		try {
			extensions['${ext_name.replace(/#/g, '.')}']();
			SC.addExtensionModule('${entrypoint}');
		}
		catch(error)
		{
			console.error(error);
		}`;
	}
};
