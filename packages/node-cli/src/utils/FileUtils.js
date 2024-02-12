/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const fs = require('fs');
const NodeTranslationService = require('../services/NodeTranslationService');
const { ERRORS } = require('../services/TranslationKeys');
const UTF8 = 'utf8';


class FileUtils {
	create(fileName, object) {
		const content = JSON.stringify(object, null,'\t');

		fs.writeFileSync(fileName, content, UTF8, function (error) {
			if (error) {
				throw NodeTranslationService.getMessage(ERRORS.WRITING_FILE, fileName, JSON.stringify(error));
			}
		});
	}

	readAsJson(filePath) {
		const content = fs.readFileSync(filePath, UTF8);
		return JSON.parse(content);
	}

	readAsString(fileName) {
		return fs.readFileSync(fileName, UTF8);
	}

	exists(fileName) {
		return fs.existsSync(fileName);
	}

	createDirectory(dirPath) {
		fs.mkdirSync(dirPath, { recursive: true })
	}

}

module.exports = new FileUtils();