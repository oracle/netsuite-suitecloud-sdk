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
