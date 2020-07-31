/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { getFoldersFromDirectory, getFilesFromDirectory } from './FileSystemService';
import path from 'path';

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

export class FileCabinetService {
	private _fileCabinetAbsolutePath: string;

	constructor(fileCabinetAbsolutePath: string) {
		this._fileCabinetAbsolutePath = fileCabinetAbsolutePath;
	}

	getFileCabinetRelativePath(file: string) {
		return file.replace(this._fileCabinetAbsolutePath, '').replace(/\\/g, '/');
	}

	getFileCabinetFolders() {
		return this._getFileCabinetFolders(this._fileCabinetAbsolutePath);
	}

	_getFileCabinetFolders(parentFolder: string) {
		const folders: string[] = [];
		const getFoldersRecursively = (source: string) =>
			getFoldersFromDirectory(source).forEach(folder => {
				folders.push(folder);
				if (this._shouldEnterFolder(folder)) {
					getFoldersRecursively(folder);
				}
			});
		getFoldersRecursively(parentFolder);

		return folders;
	}

	isUnrestrictedPath(path: string) {
		return UNRESTRICTED_PATHS.some(unrestrictedPath => this.getFileCabinetRelativePath(path).startsWith(unrestrictedPath));
	}

	_shouldEnterFolder(folder: string) {
		//Templates itself is restricted, but it has both restricted and unrestricted child folders, so we still need to get inside it.
		return this._isTemplatesFolder(folder) || (this.isUnrestrictedPath(folder) && getFilesFromDirectory(folder).length);
	}

	_isTemplatesFolder(folder: string) {
		return folder === path.join(this._fileCabinetAbsolutePath, TEMPLATES_PATH);
	}
};
