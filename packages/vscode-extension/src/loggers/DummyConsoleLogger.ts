/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ConsoleLogger } from '../util/ExtensionUtil';

export default class DummyConsoleLogger extends ConsoleLogger {
	constructor() {
		super();
	}

	// Output from VSCode doesn't accept colors, for the moment we would pring in default white
	// We could explore some workarounds in future like creating a Terminal, importing a new library or just implment it ourselves
	println(message: string): void {}

	info(message: string): void {}

	result(message: string): void {}

	warning(message: string): void {}

	error(message: string): void {}
}
