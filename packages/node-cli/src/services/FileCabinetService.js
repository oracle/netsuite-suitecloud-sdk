/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileSystemService = require('./FileSystemService');
const path = require('path');

const SUITESCRIPTS_PATH = '/SuiteScripts';
const TEMPLATES_PATH = '/Templates';
const TEMPLATES_EMAIL_TEMPLATES_PATH = '/Templates/E-mail Templates';
const TEMPLATES_MARKETING_TEMPLATES_PATH = '/Templates/Marketing Templates';
const WEB_SITE_HOSTING_FILES_PATH = '/Web Site Hosting Files';
const SUITEAPPS = '/SuiteApps';

const UNRESTRICTED_PATHS = [
	SUITESCRIPTS_PATH,
	TEMPLATES_EMAIL_TEMPLATES_PATH,
	TEMPLATES_MARKETING_TEMPLATES_PATH,
	WEB_SITE_HOSTING_FILES_PATH,
	SUITEAPPS,
];

module.exports = class FileCabinetService {
	constructor(fileCabinetAbsolutePath) {
		this._fileSystemService = new FileSystemService();
		this._fileCabinetAbsolutePath = fileCabinetAbsolutePath;
	}

	getFileCabinetRelativePath(file) {
		return file.replace(this._fileCabinetAbsolutePath, '').replace(/\\/g, '/');
	}

	getFileCabinetFolders() {
		return this._getFileCabinetFolders(this._fileCabinetAbsolutePath);
	}

	_getFileCabinetFolders(parentFolder) {
		const folders = [];
		const getFoldersRecursively = source =>
			this._fileSystemService.getFoldersFromDirectory(source).forEach(folder => {
				folders.push(folder);
				if (this._shouldEnterFolder(folder)) {
					getFoldersRecursively(folder);
				}
			});
		getFoldersRecursively(parentFolder);

		return folders;
	}

	isUnrestrictedPath(path) {
		return UNRESTRICTED_PATHS.some(unrestrictedPath => this.getFileCabinetRelativePath(path).startsWith(unrestrictedPath));
	}

	_shouldEnterFolder(folder) {
		//Templates itself is restricted, but it has both restricted and unrestricted child folders, so we still need to get inside it.
		return this._isTemplatesFolder(folder) || (this.isUnrestrictedPath(folder) && this._fileSystemService.getFilesFromDirectory(folder).length);
	}

	_isTemplatesFolder(folder) {
		return folder === path.join(this._fileCabinetAbsolutePath, TEMPLATES_PATH);
	}
};
