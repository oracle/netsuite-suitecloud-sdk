/*
** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const path = require('path');
const fs = require('fs');

const { promisify } = require('util');
class FileSystem {
	start(Service) {
		this.service = new Service();
	}

	forwardDashes(dir) {
		return dir.replace(/\\/g, '/');
	}

	createFolder(folderName, parentPath, override) {
		parentPath = this.forwardDashes(parentPath);
		const folderPath = path.join(parentPath, folderName);
		if (override) {
			this.service.deleteFolderRecursive(folderPath);
		}
		this.service.createFolder(parentPath, folderName);
		return folderPath;
	}

	getFileContent(dir) {
		return promisify(fs.readFile)(dir, 'utf8');
	}

	writeFile(dest, content) {
		return new Promise((resolve, reject) => {
			try {
				fs.writeFileSync(dest, content);
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	copyFile(src, dest) {
		(src = path.normalize(src)), (dest = path.normalize(dest));
		const folder = path.dirname(dest);
		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder, { recursive: true });
		}
		return promisify(fs.copyFile)(src, dest);
	}
}

module.exports = new FileSystem();
