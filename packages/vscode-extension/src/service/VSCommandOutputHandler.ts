/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import ActionResult from '../types/ActionResult';
import { CommandOutputHandler, unwrapExceptionMessage, unwrapInformationMessage } from '../util/ExtensionUtil';
import VSConsoleLogger from './VSConsoleLogger';

export default class VSCommandOutputHandler extends CommandOutputHandler {
	consoleLogger: VSConsoleLogger = new VSConsoleLogger();

	showSuccessResult(actionResult: ActionResult, formatOutputFunction: (actionResult: ActionResult) => void) {
		formatOutputFunction(actionResult);
	}

	showErrorResult(error: string[]) {
		this.consoleLogger.println(unwrapExceptionMessage(error));

		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			this.consoleLogger.println(`${VSConsoleLogger.lineBreak}${informativeMessage}`);
		}
	}
}
