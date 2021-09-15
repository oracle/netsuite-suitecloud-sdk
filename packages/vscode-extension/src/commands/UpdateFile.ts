/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { ApplicationConstants } from '../util/ExtensionUtil';
import { UNRESTRICTED_FOLDERS } from '../ApplicationConstants';
import { IMPORT_FILES } from '../service/TranslationKeys';
import FileImportCommon from './FileImportCommon';

const COMMAND_NAME = 'updatefile';

export default class UpdateFile extends FileImportCommon {
	constructor() {
		super(COMMAND_NAME);
	}

	validateBeforeExecute() {
		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}

		if (!this.activeFileIsUnderUnrestrictedFolder()) {
			return this.unsuccessfulValidation(this.translationService.getMessage(IMPORT_FILES.ERROR.NOT_ALLOWED_FOLDER));
		}

		return this.successfulValidation();
	}

	private activeFileIsUnderUnrestrictedFolder(): boolean {
		const activeFileRelativePath = this.activeFile?.replace(this.getFileCabinetFolerPath(), '').replace(/\\/g, '/');
		return UNRESTRICTED_FOLDERS.some((unrestricedPath) => activeFileRelativePath?.startsWith(unrestricedPath));
	}

	private getFileCabinetFolerPath(): string {
		return path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET);
	}

	async getSelectedFiles(): Promise<string[] | undefined> {
		const filePath = this.activeFile?.split(this.getFileCabinetFolerPath())[1]?.replace(/\\/g, '/');
		return filePath ? [filePath] : undefined;
	}
}
