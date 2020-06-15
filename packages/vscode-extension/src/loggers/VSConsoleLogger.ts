/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { Output } from '../suitecloud';
import { ConsoleLogger } from '../util/ExtensionUtil';

export default class VSConsoleLogger extends ConsoleLogger {
	VSConsoleLogger() {}

	// Output from VSCode doesn't accept colors, for the moment we would pring in default white
	// We could explore some workarounds in future like creating a Terminal, importing a new library or just implment it ourselves
	println(message: string) {
		Output.appendLine(message);
	}

	info(message: string) {
		this.println(message);
	}

	result(message: string) {
		this.println(message);
	}

	warning(message: string) {
		this.println(message);
	}
	error(message: string) {
		this.println(message);
	}
}
