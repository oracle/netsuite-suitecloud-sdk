/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import TranslationService from './TranslationService';
import * as messages from '../messages.json'

class NodeTranslationServiceClass extends TranslationService {

	_MESSAGES = messages;

	constructor() {
		super();
	}
}

export const NodeTranslationService = new NodeTranslationServiceClass();