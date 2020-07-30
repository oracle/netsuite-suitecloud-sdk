/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { NodeTranslationService } from '../services/NodeTranslationService';
import { CliException, isCliException } from '../CLIException';
import { COMMAND_OPTIONS_VALIDATION_ERRORS_INTERACTIVE_SUGGESTION } from '../services/TranslationKeys';
import { formatErrors } from '../utils/ValidationErrorsFormatter';

export function unwrapExceptionMessage(exception: CliException | string): string {
	return isCliException(exception) ? exception.defaultMessage : exception;
}

export function unwrapInformationMessage(exception: CliException | string) {
	return isCliException(exception) ? exception.infoMessage : '';
}

export function throwValidationException(errorMessages: string[], runInInteractiveMode: boolean, commandMetadata: {name: string; supportsInteractiveMode: boolean}): CliException {
	const formattedError = formatErrors(errorMessages);
	if (!runInInteractiveMode && commandMetadata.supportsInteractiveMode) {
		const suggestedCommandMessage = NodeTranslationService.getMessage(COMMAND_OPTIONS_VALIDATION_ERRORS_INTERACTIVE_SUGGESTION, commandMetadata.name);
		throw {
			defaultMessage: formattedError,
			infoMessage: suggestedCommandMessage
		}
	}

	throw { defaultMessage: formattedError};
}
