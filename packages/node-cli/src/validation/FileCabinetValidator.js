/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SUITESCRIPTS_PATH = "/SuiteScripts";
const TEMPLATES_PATH = "/Templates";
const TEMPLATES_EMAIL_TEMPLATES_PATH = "/Templates/E-mail Templates";
const TEMPLATES_MARKETING_TEMPLATES_PATH = "/Templates/Marketing Templates";
const WEB_SITE_HOSTING_FILES_PATH = "/Web Site Hosting Files";

const UNRESTRICTED_PATHS = [SUITESCRIPTS_PATH, TEMPLATES_EMAIL_TEMPLATES_PATH, TEMPLATES_MARKETING_TEMPLATES_PATH, WEB_SITE_HOSTING_FILES_PATH];

class FileCabinetValidator {
	pathIsUnrestricted(path) {
		//Templates folder is a special case, because it contains both restricted and unrestricted folders,
		//so return true if the path is "/Templates" itself. For any of its subfolders, check if it is in the list
		//of unretsricted paths.
		return path === TEMPLATES_PATH || UNRESTRICTED_PATHS.some(unrestrictedPath => path.startsWith(unrestrictedPath));
	}
}

module.exports = new FileCabinetValidator();
