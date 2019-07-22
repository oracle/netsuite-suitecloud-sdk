/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
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

	createFolder(folder_name, parent_path, override) {
		parent_path = this.forwardDashes(parent_path);
		const folder_path = path.join(parent_path, folder_name);
		if (override) {
			this.service.deleteFolderRecursive(folder_path);
		}
		this.service.createFolder(parent_path, folder_name);
		return folder_path;
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
