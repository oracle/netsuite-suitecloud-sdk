'use strict';

const Utils = require('../Utils');
const Log = require('../services/Log');
const path = require('path');
const _ = require('underscore');

module.exports = class AssetsCompiler{

	constructor(options){
		this.context = options.context;
		this.resource_type = 'Assets';
	}

	compile(resources){
		Log.result('COMPILATION_START', [this.resource_type]);
		resources = resources || this.context.getAssets();	
		return Utils.runParallel(this.copyResources(resources)).then(() => {
			Log.result('COMPILATION_FINISH', [this.resource_type]);
		});
	}

	copyResources(resources) {
		return _.map(resources, (resource) => () => Utils.copyFile( 
			path.join(this.context.files_path, resource.src),
			path.join(this.context.local_server_path, resource.dest)
			)
		);
	}

};
