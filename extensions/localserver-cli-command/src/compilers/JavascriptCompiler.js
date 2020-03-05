/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
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
		this.resourceType = 'Javascript';
	}

	_createFolder() {
		this.jsPath = FileSystem.createFolder('javascript', this.context.localServerPath);
	}

	async compile(resources = this.context.getJavascript()) {
		Log.result('COMPILATION_START', [this.resourceType]);
		this._createFolder();
		return Utils.runParallel(await this._createFiles(resources)).then(() => {
			Log.result('COMPILATION_FINISH', [this.resourceType]);
		});
	}

	async _createFiles(resources) {
		/**
		 * The {app}_ext.js generated file content will be like:
		 *	`var extensions = {};`
		 *	`javascriptModules`
		 *	`last javascript must be the entrypoint`
		 *	`contentAtTheEnd (call methods in javascriptModules)`
		 */
		const applicationFiles = {
			checkout: { javascriptModules: {}, contentAtTheEnd: '' },
			shopping: { javascriptModules: {}, contentAtTheEnd: '' },
			myaccount: { javascriptModules: {}, contentAtTheEnd: '' },
		};

		const readFilesPromises = [];
		for (const resourcePath in resources) {
			const resource = resources[resourcePath];
			readFilesPromises.push(
				// read all files content:
				resource.sourceContent().then(content => {
					// then add the file content on each applicationFile
					resource.applications.forEach(appName => {
						const extName = resource.extensionFullname;
						const appFile = applicationFiles[appName];
						appFile.javascriptModules[extName] =
							appFile.javascriptModules[extName] || '';
						// if it is an entrypoint, append to the end
						// also add a try catch block that call SC.addExtensionModule
						if (resource.isEntrypoint) {
							appFile.contentAtTheEnd += this._createTryCatchBlock(
								resource.name,
								resource.extensionFullname
							);
							appFile.javascriptModules[extName] += content;
						} else {
							// if it is not an entrypoint, append first
							appFile.javascriptModules[extName] =
								content + appFile.javascriptModules[extName];
						}
					});
				})
			);
		}

		await Promise.all(readFilesPromises);

		const writeFilesPromises = [];

		for (const appName in applicationFiles) {
			const applicationFile = applicationFiles[appName];
			// javascript modules content:
			const javascriptModules = [];
			for (const extName in applicationFile.javascriptModules) {
				javascriptModules.push(
					this._createModuleBlock(applicationFile.javascriptModules[extName], extName)
				);
			}
			// define full content and dest and write file.
			const content = `
				var extensions = {};
				${javascriptModules.join('')}
				${applicationFile.contentAtTheEnd}
			`;
			const dest = path.join(this.jsPath, `${appName}_ext.js`);
			writeFilesPromises.push(() => FileSystem.writeFile(dest, content));
		}
		return writeFilesPromises;
	}

	_createModuleBlock(content, extName) {
		return `
		extensions["${extName.replace(/#/g, '.')}"] = function() {			
			function getExtensionAssetsPath(asset){
				return 'assets/${extName.replace(/#/g, '/')}/' + asset;
			}
			${content}
		};`;
	}

	_createTryCatchBlock(entrypoint, extName) {
		return `
		try {
			extensions['${extName.replace(/#/g, '.')}']();
			SC.addExtensionModule('${entrypoint}');
		}
		catch(error)
		{
			console.error(error);
		}`;
	}
};
