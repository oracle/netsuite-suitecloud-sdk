/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');

const NodeConsoleLogger = require('../../loggers/NodeConsoleLogger');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { lineBreak } = require('../../loggers/LoggerConstants');
const {
	ERRORS,
	LICENSE_INTRO,
} = require('../../services/TranslationKeys');

const licenseFileEncoding = 'utf8';
const licenseFilePath = 'resources/FUTC-LICENSE.txt';

function display() {

	try {
		const license = fs.readFileSync(licenseFilePath, licenseFileEncoding);
		const intro = NodeTranslationService.getMessage(LICENSE_INTRO);
		NodeConsoleLogger.important(`${lineBreak}${intro}${lineBreak}`);
		NodeConsoleLogger.info(license);
	} catch (err) {
		NodeConsoleLogger.error(NodeTranslationService.getMessage(ERRORS.MISSING_LICENSE_FILE));
		process.exit();
	}
}

module.exports = { display };
