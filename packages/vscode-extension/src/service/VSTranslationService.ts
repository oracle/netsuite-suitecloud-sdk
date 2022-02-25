/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { join } from 'path';
import { FileUtils, TranslationService } from '../util/ExtensionUtil';

const MESSAGES_PATH = '../../messages.json';

export class VSTranslationService extends TranslationService {
	constructor() {
		super();
		let filePath = join(__dirname, MESSAGES_PATH);
		this._MESSAGES = FileUtils.readAsJson(filePath);
	}

	getMessage(key: string, ...params: string[]): string {
		return super.getMessage(key, ...params);
	}
}
