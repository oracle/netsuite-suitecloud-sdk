/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');
const BaseOutputHandler = require('./basecommand/BaseOutputHandler');

module.exports = class Command {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(options.log);
		assert(options.run instanceof Function);

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._run = options.run;
	}

	get commandMetadata() {
		return this._commandMetadata;
	}

	get projectFolder() {
		return this._projectFolder;
	}

	get run() {
		return this._run;
	}

};
