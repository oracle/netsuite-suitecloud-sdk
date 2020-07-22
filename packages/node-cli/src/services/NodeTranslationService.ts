/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import * as path from 'path';
import TranslationService from './TranslationService';
import { DEFAULT_MESSAGES_FILE } from '../ApplicationConstants';
import { readAsJson } from '../utils/FileUtils';

class NodeTranslationServiceClass extends TranslationService {

	_MESSAGES = readAsJson(path.join(__dirname, DEFAULT_MESSAGES_FILE));

	constructor() {
		super();
	}
}

export const NodeTranslationService = new NodeTranslationServiceClass();