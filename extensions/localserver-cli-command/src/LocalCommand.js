/*
** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const DeployXml = require('./DeployXml');
const Compiler = require('./compilers/Compiler');
const CompilationContext = require('./CompilationContext');
const LocalServer = require('./LocalServer');

const Translation = require('./services/Translation');
const Log = require('./services/Log');
const FileSystem = require('./services/FileSystem');
const Watch = require('./Watch');

module.exports = class LocalCommand {
	constructor(options) {
		this._projectFolder = options.projectFolder;
		Translation.start(...options.translation);
		Log.start(options.colors);
		FileSystem.start(options.filesystem);
	}

	initialize() {
		if (this.init) {
			return;
		}
		this.init = true;

		const deployXml = new DeployXml({ projectFolder: this._projectFolder });
		const objects = deployXml.getObjects();

		this.objectsPath = deployXml.objectsPath;
		this.filesPath = deployXml.filesPath;
		this.themes = objects.themes;
		this.extensions = objects.extensions;
	}

	getCommandQuestions(prompt) {
		let extensions = Object.keys(this.extensions),
			themes = Object.keys(this.themes);
		let options = [
			{
				type: 'list',
				name: 'theme',
				message: Translation.getMessage('CHOOSE_THEME'),
				choices: this._validateTheme(themes),
			},
		];

		if (extensions.length) {
			options.push({
				type: 'checkbox',
				name: 'extensions',
				message: Translation.getMessage('CHOOSE_EXTENSION'),
				choices: extensions,
			});
		}

		return prompt(options);
	}

	async executeAction(answers) {
		if (!answers.extensions || answers.extensions === true) {
			answers.extensions = [];
		}
		const theme = answers.theme;
		let extensionsList = Array.isArray(answers.extensions)
			? answers.extensions
			: answers.extensions.split(',');
		const extensions = extensionsList.map(extension => extension.trim());

		//Validate answers
		this._validateTheme(theme);
		this._validateExtensions(extensions);

		LocalServer.config({ port: answers.port, runhttps: answers.runhttps });

		const context = this._createCompilationContext(theme, extensions);
		const compiler = new Compiler({ context: context });
		const watch = new Watch({ context: context, compilers: compiler.compilers });

		await compiler.compile();

		watch.start();

		return LocalServer.startServer(context.localServerPath);
	}

	_createCompilationContext(theme, extensions) {
		return new CompilationContext({
			theme: theme,
			extensions: extensions,
			objectsPath: this.objectsPath,
			filesPath: this.filesPath,
			projectFolder: this._projectFolder,
		});
	}

	_validateTheme(theme) {
		if (Array.isArray(theme)) {
			// interactive mode
			if (!theme.length) {
				throw new Error(Translation.getMessage('NO_THEMES', [this.objectsPath]));
			}
		} else {
			if (!this.themes[theme]) {
				throw new Error(
					Translation.getMessage('RESOURCE_NOT_FOUND', [theme, this.objectsPath])
				);
			}
		}

		return theme;
	}

	_validateExtensions(extensions) {
		extensions.forEach(extension => {
			if (!this.extensions[extension]) {
				throw Translation.getMessage('RESOURCE_NOT_FOUND', [extension, this.objectsPath]);
			}
		});

		return extensions;
	}
};
