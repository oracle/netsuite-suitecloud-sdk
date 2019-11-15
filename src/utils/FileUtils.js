/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const fs = require('fs');
const TranslationService = require('../services/TranslationService'); 
const { ERRORS } = require('../services/TranslationKeys');
const UTF8 = 'utf8';


 class FileUtils {
	create(fileName, object) {
		const content = JSON.stringify(object);

		fs.writeFileSync(fileName, content, UTF8, function(error) {
			if (error) {
				throw TranslationService.getMessage(ERRORS.WRITING_FILE, fileName, JSON.stringify(error));
			}
		});
	}

	readAsJson(filePath) {
		const content = fs.readFileSync(filePath, UTF8);
		return JSON.parse(content);
	}

	readAsString(fileName) {
		const content = fs.readFileSync(fileName, UTF8);
		return content;
	}

	exists(fileName) {
		return fs.existsSync(fileName);
	}
}

module.exports = new FileUtils();