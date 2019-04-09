'use strict';

const DeployXml = require('./DeployXml');
const Compiler = require('./Compilers/Compiler');
const CompilationContext = require('./CompilationContext');
const LocalServer = require('./LocalServer');

const _ = require('underscore');

module.exports = class LocalCommand {

	constructor(options){
		this._projectFolder = options.projectFolder;
	}

	initialize(){	

		const deploy_xml = new DeployXml({projectFolder: this._projectFolder});
		const objects = deploy_xml.getObjects();

		this.objects_path = deploy_xml.objects_path;
		this.files_path = deploy_xml.files_path;
		this.themes = objects.themes;
		this.extensions = objects.extensions;
	}

	getCommandQuestions(prompt){
		return prompt([
			{
				type: 'list',
				name: 'theme',
				message: 'Choose the a Theme',
				choices: Object.keys(this.themes),
			},
			{
				type: 'checkbox',
				name: 'extensions',
				message: 'Choose the Extensions',
				choices: Object.keys(this.extensions),
			}
		]);
	}

	executeAction(answers){
		if(!answers.extensions || answers.extensions === true){
			answers.extensions = [];
		}
		const theme = answers.theme;
		const extensions = Array.isArray(answers.extensions) ? answers.extensions : answers.extensions.split(',');

		//Validate answers
		this._validateTheme(theme);
		this._validateExtensions(extensions);

		const context = this._createCompilationContext(theme, extensions);
		const compiler = new Compiler({context: context});
		const local_server = new LocalServer({context: context});

		return compiler.compile().then(()=>{
			_.bind(local_server.startServer, local_server)();
			return "Finished";
		});
	}

	_createCompilationContext(theme, extensions){
		return new CompilationContext({
			theme: theme,
			extensions: extensions,
			objects_path: this.objects_path,
			files_path: this.files_path,
			project_folder: this._projectFolder
		});
	}

	_validateTheme(theme){
		if(!this.themes[theme]){
			throw `Theme ${theme} not found in ${this.objects_path}`;
		}
	}

	_validateExtensions(extensions){
		_.each(extensions, (extension) => {
			if(!this.extensions[extension]){
				throw `Theme ${extension} not found in ${this.objects_path}`;
			}
		});
	}

};
