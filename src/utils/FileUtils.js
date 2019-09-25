/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const TranslationService = require('../services/TranslationService'); 
const { ERRORS } = require('../services/TranslationKeys'); 

const fs = require('fs');

 class FileUtils {
	create(fileName, object) {
		const content = JSON.stringify(object);

		fs.writeFileSync(fileName, content, 'utf8', function(error) {
			if (error) {
				throw TranslationService.getMessage(ERRORS.WRITNG_FILE, fileName, JSON.stringify(error));
			}
		});
	}

	readAsJson(filePath) {
		const content = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(content);
	}

	readAsString(fileName) {
		const content = fs.readFileSync(fileName, 'utf8');
		return content;
	}

	exists(fileName) {
		return fs.existsSync(fileName);
	}
}

module.exports = new FileUtils();