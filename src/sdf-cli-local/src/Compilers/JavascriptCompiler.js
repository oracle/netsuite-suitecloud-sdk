'use strict';

const Utils = require('../Utils');
const Log = require('../services/Log');
const path = require('path');
const _ = require('underscore');
const FileSystem = require('../services/FileSystem');

module.exports = class JavascriptCompiler {
	constructor(options) {
		this.context = options.context;
		this.compiled_files = { checkout: {}, shopping: {}, myaccount: {} };
		this.resource_type = 'Javascript';
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resource_type]);
		resources = resources || this.context.getJavascript();

		this.createFolder();

		return Utils.runParallel(this.copyResources(resources)).then(() => {
			Log.result('COMPILATION_FINISH', [this.resource_type]);
		});
	}

	readFiles(resources) {
		return _.map(resources, resource => {
			return resource.sourceContent().then(content => {
				resource.applications.forEach(app => {
					// read and add all content to a app/vendor.extension.version object
					this.compiled_files[app][resource.extension_fullname] += content;
				});
			});
		});
	}

	copyResources(resources) {
		var waitForAllFiles = this.readFiles(resources);
		Promise.all(waitForAllFiles).then(e => {
			//apps:
			_.each(this.compiled_files, app => {
				//extensions
				_.each(app, extension => {});
			});
		});
	}

	wrapExtModule() {
		// extensions["MatiG.ExtTest.1.0.0"] = function() {
	}

	createFolder() {
		this.js_path = FileSystem.createFolder('javascript', this.context.local_server_path);
	}
};
