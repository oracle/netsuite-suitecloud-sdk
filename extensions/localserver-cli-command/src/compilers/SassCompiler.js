/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const Utils = require('../Utils');
const FileSystem = require('../services/FileSystem');
const Log = require('../services/Log');
const sassCompiler = require('node-sass');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

module.exports = class SassCompiler {
	constructor(options) {
		this.context = options.context;
		this.resourceType = 'Sass';
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resourceType]);
		this._createCssFolder();
		this.overrides = this.context.getSassOverrides();
		resources = this.context.getSass();

		const metaEntrypoints = this._buildMetaEntrypoints(resources.entrypoints);

		return Utils.runParallel(metaEntrypoints).then(() => {
			Log.result('COMPILATION_FINISH', [this.resourceType]);
		});
	}

	_createCssFolder() {
		this.cssPath = FileSystem.createFolder('css', this.context.localServerPath);
	}

	_buildMetaEntrypoints(entrypoints) {
		const promises = [];
		for (const app in entrypoints) {
			const entrypoint = entrypoints[app]
				.map(file => {
					const localFunctions = this._localFunctions({
						assetsFolder: FileSystem.forwardDashes(file.assetsPath),
					});
					file.entry = FileSystem.forwardDashes(file.entry);
					return localFunctions + `@import "${file.entry}";`;
				})
				.join('');
			promises.push(() => this._compile(entrypoint, app));
		}
		return promises;
	}

	_compile(entrypoint, app) {
		return new Promise((resolve, reject) => {
			Log.result('COMPILATION_START_FOR', [this.resourceType, app]);
			sassCompiler.render(
				{
					data: entrypoint,
					includePaths: [this.context.filesPath],
					importer: this._importer.bind(this),
				},
				(error, result) => {
					if (error) {
						return reject(error);
					}

					const localPath = path.join(this.cssPath, app + '.css');
					fs.writeFileSync(localPath, result.css);

					Log.result('COMPILATION_FINISH_FOR', [this.resourceType, app]);
					resolve(localPath);
				}
			);
		});
	}

	_localFunctions(options = {}) {
		return [
			`@function getThemeAssetsPath($asset) { @return '../${
				options.assetsFolder
			}/' + $asset; }`,
			`@function getExtensionAssetsPath($asset) { @return '../${
				options.assetsFolder
			}/' + $asset; }`,
		].join('\n');
	}

	_importer(url, prev, done) {
		prev = prev === 'stdin' ? this.context.filesPath : path.dirname(prev);

		let currentPath = path.normalize(path.resolve(prev, url));
		currentPath = path.extname(currentPath) ? currentPath : currentPath + '.scss';
		currentPath = currentPath.replace(this.context.filesPath, '').substr(1);

		const override = this.overrides[currentPath];
		let result;
		if (override) {
			Log.default('OVERRIDE', [currentPath, override.src]);
			const fullPath = glob(path.join(this.context.projectFolder, '**', override.src));
			if (fullPath.length) {
				result = { file: fullPath[0] };
			}
		}
		done(result);
	}
};
