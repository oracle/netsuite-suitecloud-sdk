/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const fs = require('fs');
const UTF8 = 'utf8';

class FileUtils {

	readAsString(fileName) {
		return fs.readFileSync(fileName, UTF8);
	}

	readAsJson(filePath) {
		const content = fs.readFileSync(filePath, UTF8);
		return JSON.parse(content);
	}

	exists(fileName) {
		return fs.existsSync(fileName);
	}
}

module.exports = new FileUtils();
