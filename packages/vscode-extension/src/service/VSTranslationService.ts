/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { join } from 'path';
import { readAsJson } from '@oracle/suitecloud-cli/dist/utils/FileUtils'
import TranslationService from '@oracle/suitecloud-cli/dist/services/TranslationService'

const MESSAGES_PATH = '../../messages.json';

export class VSTranslationService extends TranslationService {

	_MESSAGES = readAsJson(join(__dirname, MESSAGES_PATH));

	constructor() {
		super();
	}
}