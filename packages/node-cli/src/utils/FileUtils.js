/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const fs = require('fs');
const UTF8 = 'utf8';

class FileUtils {
	create(fileName, object) {
		const content = JSON.stringify(object, null,'\t');

		fs.writeFileSync(fileName, content, UTF8, function (error) {
			if (error) {
				// Using hardcoded message to avoid circular dependency as NodeTranslationService imports FileUtils
				// TODO restore: throw NodeTranslationService.getMessage(ERRORS.WRITING_FILE, fileName, JSON.stringify(error));
				// when NodeTranslationService is refactored to use node require to retrieve messages.json file
				throw `There was a problem while creating the file ${fileName}.\n  Error: ${error}`
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