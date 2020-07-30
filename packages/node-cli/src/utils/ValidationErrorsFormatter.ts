/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { NodeTranslationService } from '../services/NodeTranslationService';
import { COMMAND_OPTIONS_VALIDATION_ERRORS } from '../services/TranslationKeys';
import { lineBreak } from '../loggers/LoggerConstants';
import assert from 'assert';

export function formatErrors(validationErrors: string[]) {
	assert(validationErrors);
	assert(Array.isArray(validationErrors));

	const errorMessageHeader = NodeTranslationService.getMessage(COMMAND_OPTIONS_VALIDATION_ERRORS);
	const validationErrorsString = validationErrors.join(lineBreak);
	return `${errorMessageHeader}${lineBreak}${validationErrorsString}`;
}
