/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { Output } from '../extension';
import { ConsoleLogger } from '../util/ExtensionUtil';

class color {
	SUCCESS: string = 'SUCCESS';
	ERROR: string = 'ERROR';
}

export default class VSConsoleLogger extends ConsoleLogger {
	VSConsoleLogger() {}

	println(message: string, color?: color) {
		Output.appendLine(message);
	}

	logErrors(errorMessages: string[]) {
		errorMessages.forEach((message: string) => this.println(message));
	}
}
