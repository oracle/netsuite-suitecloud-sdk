/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { padding } from './LoggerConstants';

export default abstract class ConsoleLogger {
	constructor() {}

	abstract info(message: string): void;

	abstract result(message: string): void;

	abstract warning(message: string): void;

	abstract error(message: string): void;

	getPadding(padCount: number) {
		if (padCount) {
			let paddings = '';
			for (let i = 0; i < padCount; i++) {
				paddings += padding;
			}
			return paddings;
		}
		return padding;
	}
}
