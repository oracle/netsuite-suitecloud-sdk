'use strict';

const Log = require('./services/Log');
const Who = require('./services/Who');

const express = require('express');
const cors = require('cors');
const _ = require('underscore');

module.exports = class LocalServer {

	constructor(options){
		this.context = options.context;
	}

	startServer(files){
		files = _.flatten(files);

		//TODO override with config values
		let server_config = {
			run_https: false,
			port: 7777,
			folders: [this.context.local_server_path]
		};

		const app = express();
		app.use(cors({origin: true}));

		_.each(server_config.folders, (folder) => {
			app.use('/', express.static(folder));
		});

		//Service used by the index-local.ssp files to know what files load
		app.use('/who/:app', this._whoService);
		//Serves the script patch to ignore tpl defines executed by core javascript file
		app.use('/define_patch.js', this._definePatchService);
		
		app.listen(server_config.port, () => {
			this._localMessage(server_config);
		});

		//server is listening so we return a new promise that will never be resolved
		return new Promise(() => {});
	}

	_whoService(req, res){
		return new Who(req, res);
	}

	_definePatchService(){

	}

	_localMessage(server_config){
		Log.info(Log.separator);
		Log.default('SERVER', [server_config.run_https ? 's' : '', server_config.port]);
		Log.info('WATCH', [server_config.folders]);
		Log.info('SSP_LOCAL_FILES_INFO');
		Log.default('CANCEL_ACTION');
	}

};
