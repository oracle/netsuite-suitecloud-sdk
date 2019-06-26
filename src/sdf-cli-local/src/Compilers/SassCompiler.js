'use strict';

const Utils = require('../Utils');
const FileSystem = require('../services/FileSystem');
const Log = require('../services/Log');
const _ = require('underscore');
const sass_compiler = require('node-sass');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

module.exports = class SassCompiler {
	constructor(options) {
		this.context = options.context;
		this.resource_type = 'Sass';
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resource_type]);
		this.createCssFolder();
		this.overrides = this.context.getSassOverrides();
		resources = this.context.getSass();

		const meta_entrypoints = this.buildMetaEntrypoints(resources.entrypoints);

		return Utils.runParallel(
			_.map(meta_entrypoints, (meta_entrypoint, app) => {
				return () => this._compile(meta_entrypoint, app);
			})
		).then(() => {
			Log.result('COMPILATION_FINISH', [this.resource_type]);
		});
	}

	createCssFolder() {
		this.css_path = FileSystem.createFolder('css', this.context.local_server_path);
	}

	buildMetaEntrypoints(entrypoints) {
		return _.mapObject(entrypoints, files => {
			return _.map(files, file => {
				const local_functions = this._localFunctions({
					assets_folder: FileSystem.forwardDashes(file.assets_path),
				});
				file.entry = FileSystem.forwardDashes(file.entry);
				return local_functions + `@import "${file.entry}";`;
			}).join('');
		});
	}

	_compile(entrypoint, app) {
		return new Promise((resolve, reject) => {
			Log.result('COMPILATION_START_FOR', [this.resource_type, app]);

			sass_compiler.render(
				{
					data: entrypoint,
					includePaths: [this.context.files_path],
					importer: _.bind(this._importer, this),
				},
				(error, result) => {
					if (error) {
						return reject(error);
					}

					const local_path = path.join(this.css_path, app + '.css');
					fs.writeFileSync(local_path, result.css);

					Log.result('COMPILATION_FINISH_FOR', [this.resource_type, app]);
					resolve(local_path);
				}
			);
		});
	}

	_localFunctions(options = {}) {
		return [
			`@function getThemeAssetsPath($asset) { @return '../${
				options.assets_folder
			}/' + $asset; }`,
			`@function getExtensionAssetsPath($asset) { @return '../${
				options.assets_folder
			}/' + $asset; }`,
		].join('\n');
	}

	_importer(url, prev, done) {
		prev = prev === 'stdin' ? this.context.files_path : path.dirname(prev);

		let current_path = path.normalize(path.resolve(prev, url));
		current_path = path.extname(current_path) ? current_path : current_path + '.scss';
		current_path = current_path.replace(this.context.files_path, '').substr(1);

		const override = this.overrides[current_path];
		let result;
		if (override) {
			Log.default('OVERRIDE', [current_path, override.src]);
			const full_path = glob(path.join(this.context.project_folder, '**', override.src));
			if (full_path.length) {
				result = { file: full_path[0] };
			}
		}
		done(result);
	}
};
