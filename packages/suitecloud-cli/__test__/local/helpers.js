/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const path = require('path');
const fs = require('fs');

// normally this is called only when localserver command is executed
const FileSystem = require('@oracle/sdf-cli-local/src/services/FileSystem');
FileSystem.start(require('../../src/services/FileSystemService'));

const ROOT = './__test__/local';
const CUSTOM_ASSETS_PATH = path.resolve(ROOT, 'custom_assets');
const SERVERPATH = path.resolve(ROOT, 'localserver');

module.exports.ROOT = ROOT;
module.exports.SERVERPATH = SERVERPATH;
module.exports.CUSTOM_ASSETS_PATH = CUSTOM_ASSETS_PATH;
module.exports.createLocalserverFolder = function() {
	if (!fs.existsSync(SERVERPATH)) {
		fs.mkdirSync(SERVERPATH, { recursive: true });
	}
};
module.exports.removeFolder = function(folder = '') {
	(function deleteFolderRecursive(dir) {
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(file => {
				let currentPath = path.join(dir, file);
				if (fs.lstatSync(currentPath).isDirectory()) {
					// recurse
					deleteFolderRecursive(currentPath);
				} else {
					// delete file
					fs.unlinkSync(currentPath);
				}
			});
			fs.rmdirSync(dir);
		}
	})(path.join(SERVERPATH, folder));
	if (fs.existsSync(SERVERPATH) && fs.readdirSync(SERVERPATH).length == 0){
		fs.rmdirSync(SERVERPATH);
	}
};
module.exports.mockClearConsoleLog = function() {
	console.log = jest.fn();
	console.log.mockClear();
};