/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

const path = require('path');
import { TranslationService } from '../util/ExtensionUtil';

const filePath = '../../../vscode-extension/messages.json';

export class VSTranslationService extends TranslationService {
	constructor() {
		super(filePath);
	}
}
