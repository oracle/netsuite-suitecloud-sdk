'use strict';

const path = require('path');
const fs = require('fs');

// normally this is called only when localserver command is executed
const FileSystem = require('../../src/sdf-cli-local/src/services/FileSystem');
FileSystem.start(require('../../src/services/FileSystemService'));

const ROOT = './__test__/local';
const CUSTOM_ASSETS_PATH = path.resolve(ROOT, 'custom_assets');
const SERVERPATH = path.resolve(ROOT, 'localserver');

module.exports.ROOT = ROOT;
module.exports.SERVERPATH = SERVERPATH;
module.exports.CUSTOM_ASSETS_PATH = CUSTOM_ASSETS_PATH;
module.exports.createLocalserverFolder = function() {
	fs.mkdirSync(SERVERPATH, { recursive: true });
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
};
module.exports.mockClearConsoleLog = function() {
	console.log = jest.fn();
	console.log.mockClear();
};
