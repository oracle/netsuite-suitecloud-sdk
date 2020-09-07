/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const NodeTranslationService = require('../services/NodeTranslationService');
const { ERRORS } = require('../services/TranslationKeys');
const UTF8 = 'utf8';
const Path = require('path');

class FileUtils {
	create(fileName, object) {
		const content = JSON.stringify(object);

		fs.writeFileSync(fileName, content, UTF8, function (error) {
			if (error) {
				throw NodeTranslationService.getMessage(ERRORS.WRITING_FILE, fileName, JSON.stringify(error));
			}
		});
	}

	createDirectory(dirPath) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	createTempDir(directory) {
		if (!fs.existsSync(directory)) {
			this.createDirectory(directory);
		}
	}

	copyFile(originalFile, newFile) {
		if(this.exists(originalFile)){
			fs.copyFileSync(originalFile,newFile);
		}
		else {
			throw NodeTranslationService.getMessage(ERRORS.FILE_NOT_EXIST, originalFile);
		}
	}

	deleteDirandFilesRecursively(path) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach((file) => {
				const filePath = Path.join(path, file);
				if (fs.lstatSync(filePath).isDirectory()) {
					deleteDirandFilesRecursively(filePath);
				} else {
					fs.unlinkSync(filePath);
				}
			});
			fs.rmdirSync(path);
		}
	}

	exists(fileName) {
		return fs.existsSync(fileName);
	}

	readAsJson(filePath) {
		const content = fs.readFileSync(filePath, UTF8);
		return JSON.parse(content);
	}

	readAsString(fileName) {
		return fs.readFileSync(fileName, UTF8);
	}

}

module.exports = new FileUtils();
