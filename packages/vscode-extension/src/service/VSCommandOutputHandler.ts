/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { scloudOutput } from '../extension';
import OperationResult from '../OperationResult';
import { NodeUtils, unwrapExceptionMessage, unwrapInformationMessage } from '../util/ExtensionUtil';

export default class VSCommandOutputHandler {
	private static defaultSuccessOutputFormat(actionResult: OperationResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.RESULT);
		scloudOutput.appendLine(actionResult.resultMessage);
		actionResult.data.forEach((element: any) => {
			scloudOutput.appendLine(element);
		});
	}

	private static defaultErrorOutputFormat(actionResult: OperationResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.ERROR);
		scloudOutput.appendLine(actionResult.resultMessage);
		if (Array.isArray(actionResult.errorMessages)) {
			actionResult.errorMessages.forEach(error => {
				NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
				scloudOutput.appendLine(error);
				const informativeMessage = unwrapInformationMessage(error);

				if (informativeMessage) {
					NodeUtils.println(`${NodeUtils.lineBreak}${informativeMessage}`, NodeUtils.COLORS.INFO);
					scloudOutput.appendLine(informativeMessage);
				}
			});
		}
	}
	static showSuccessResult(actionResult: any, formatOutputFunction?: (arg0: any) => void) {
		if (formatOutputFunction) {
			formatOutputFunction(actionResult);
		} else {
			this.defaultSuccessOutputFormat(actionResult);

		}
	}

	static showErrorResult(actionResult: any, formatOutputFunction?: (arg0: any) => void) {
		if (formatOutputFunction) {
			formatOutputFunction(actionResult);
		} else {
			this.defaultErrorOutputFormat(actionResult);

		}
	}
};