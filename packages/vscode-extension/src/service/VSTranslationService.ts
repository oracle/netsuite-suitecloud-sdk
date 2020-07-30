/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import TranslationService from '@oracle/suitecloud-cli/dist/services/TranslationService';
import * as messages from '../messages.json';

export class VSTranslationService extends TranslationService {

	_MESSAGES = messages;

	constructor() {
		super();
	}
}