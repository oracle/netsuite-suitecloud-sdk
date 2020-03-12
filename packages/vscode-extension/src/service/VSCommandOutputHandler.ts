/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { Output } from '../extension';
import OperationResult from '../types/OperationResult';
import { NodeUtils, unwrapExceptionMessage, unwrapInformationMessage } from '../util/ExtensionUtil';

export default class VSCommandOutputHandler {
	private defaultSuccessOutputFormat(operationResult: OperationResult) {
		NodeUtils.println(operationResult, NodeUtils.COLORS.RESULT);
		Output.appendLine(operationResult.resultMessage);
		operationResult.data.forEach((element: any) => {
			Output.appendLine(element);
		});
	}

	private defaultErrorOutputFormat(operationResult: OperationResult) {
		NodeUtils.println(operationResult, NodeUtils.COLORS.ERROR);
		Output.appendLine(operationResult.resultMessage);
		if (Array.isArray(operationResult.errorMessages)) {
			operationResult.errorMessages.forEach(error => {
				NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
				Output.appendLine(error);
				const informativeMessage = unwrapInformationMessage(error);

				if (informativeMessage) {
					NodeUtils.println(`${NodeUtils.lineBreak}${informativeMessage}`, NodeUtils.COLORS.INFO);
					Output.appendLine(informativeMessage);
				}
			});
		}
	}
	showSuccessResult(operationResult: OperationResult, formatOutputFunction?: (arg0: OperationResult) => void) {
		if (formatOutputFunction) {
			formatOutputFunction(operationResult);
		} else {
			this.defaultSuccessOutputFormat(operationResult);

		}
	}

	showErrorResult(operationResult: OperationResult, formatOutputFunction?: (arg0: OperationResult) => void) {
		if (formatOutputFunction) {
			formatOutputFunction(operationResult);
		} else {
			this.defaultErrorOutputFormat(operationResult);

		}
	}
};