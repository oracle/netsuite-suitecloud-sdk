'use strict';

const Utils = require('../Utils');
const _ = require('underscore');
const sass_compiler = require('node-sass');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

module.exports = class SassCompiler{

	constructor(options){
		this.context = options.context;
		this.resource_type = 'Sass';
	}

	compile(resources){
		Utils.log(`Starting ${this.resource_type} compilation`, Utils.COLORS.RESULT);
		this.createCssFolder();
		this.overrides = this.context.getSassOverrides();
		resources = this.context.getSass();

		const meta_entrypoints = this.buildMetaEntrypoints(resources.entrypoints);

		return Utils.runParallel(_.map(meta_entrypoints, (meta_entrypoint, app) => {
			return () => this._compile(meta_entrypoint, app);
		}))
		.then(() => {
			Utils.log(`Finished ${this.resource_type} compilation`, Utils.COLORS.RESULT);
		});
	}

	createCssFolder(){
		this.css_path = Utils.createFolder('css', this.context.local_server_path);
	}

	buildMetaEntrypoints(entrypoints){
		const project_path = this.context.files_path;

		return _.mapObject(entrypoints, (file_paths) => {
			return _.map(file_paths, (file_path) => {
				file_path = file_path.replace(/\\/g, '/');
				return `@import "${file_path}";`
			}).join('');
		});
	}

	_compile(entrypoint, app){
		return new Promise((resolve, reject) => {
			Utils.log(`Starting ${this.resource_type} compilation for ${app}`, Utils.COLORS.RESULT);

			sass_compiler.render(
				{
					data: entrypoint,
					includePaths: [this.context.files_path],
					importer: _.bind(this._importer, this)
				},
				(error, result) => {
					if (error) {						
						return reject(error);
					}
					
					const local_path = path.join(this.css_path, app + '.css');
					fs.writeFileSync(local_path, result.css);

					Utils.log(`Finished ${this.resource_type} compilation for ${app}`, Utils.COLORS.RESULT);
					resolve(local_path);
				}
			);
		});
	}

	_importer(url, prev, done){
		prev = prev === 'stdin' ? this.context.files_path : path.dirname(prev);

		let current_path = path.normalize(path.resolve(prev, url));
		current_path = path.extname(current_path) ? current_path : current_path + '.scss';
		current_path = current_path.replace(this.context.files_path, '').substr(1);

		const override = this.overrides[current_path];
		let result;
		if(override){
			Utils.log(`Overriding: ${current_path}\nWith: ${override.src}`);

			const full_path = glob(path.join(this.context.project_folder, '**', override.src));
			if(full_path.length){
				result = {file: full_path[0]};
			}
		}
		done(result);
	}

};
