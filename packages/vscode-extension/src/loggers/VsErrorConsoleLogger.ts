/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import VSConsoleLogger from './VSConsoleLogger';

export default class VsErrorConsoleLogger extends VSConsoleLogger {
	// We rewrite only the info method because we don't want to show the normal info with the
	// VsErrorConsoleLogger, but we are interested in showing the errors and warnings.
	info(message: string): void {}

	result(message: string): void {}
}
