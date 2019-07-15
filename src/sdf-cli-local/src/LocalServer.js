'use strict';

const Log = require('./services/Log');
const whoService = require('./services/Who');

const express = require('express');
const cors = require('cors');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

module.exports = class LocalServer {
	constructor(options) {
		this.context = options.context;
	}

	startServer(files) {
		files = _.flatten(files);

		//TODO override with config values
		let server_config = {
			run_https: false,
			port: 7777,
			folders: [this.context.local_server_path],
		};

		const app = express();
		app.use(cors({ origin: true }));

		_.each(server_config.folders, folder => {
			app.use('/', express.static(folder));
		});

		//Service used by the index-local.ssp files to know what files load
		app.use('/who/:app', whoService);
		//Serves the script patch to ignore tpl defines executed by core javascript file
		app.use('/define_patch.js', this._definePatchService);
		//Serves the script for requirejs
		app.use('/require.js', this._getRequireJs);

		app.listen(server_config.port, () => {
			this._localMessage(server_config);
		});

		//server is listening so we return a new promise that will never be resolved
		return new Promise(() => {});
	}

	_definePatchService(req, res) {
		var response = function define_patch() {
			var src_define = define;
			define = function define(name, cb) {
				var is_tpl = name && /\.tpl$/.test(name);
				var cb_string = cb ? cb.toString().replace(/\s/g, '') : '';
				var is_empty_cb = cb_string === 'function(){}';

				if (is_tpl && is_empty_cb) {
					return;
				}
				return src_define.apply(this, arguments);
			};

			define.amd = {
				jQuery: true,
			};
		};

		res.setHeader('Content-Type', 'application/javascript');
		res.send(`${response}; define_patch();`);
	}

	_getRequireJs(req, res) {
		const src = path.join(
			process.mainModule.filename,
			'../..',
			'node_modules',
			'sdf-cli-local',
			'node_modules',
			'requirejs',
			'require.js'
		);
		res.setHeader('Content-Type', 'application/javascript');
		res.send(fs.readFileSync(src).toString());
	}

	_localMessage(server_config) {
		Log.info(Log.separator);
		Log.default('SERVER', [server_config.run_https ? 's' : '', server_config.port]);
		Log.info('WATCH', [server_config.folders]);
		Log.info('SSP_LOCAL_FILES_INFO');
		Log.default('CANCEL_ACTION');
	}
};
