/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Inquirer 14 is ESM-only, causing compatibility issues with Jest's CommonJS-style loading.
// Unit tests exercise command behavior rather than terminal rendering, so this setup.js is used to keep its interactive boundary mocked under Jest.
jest.mock('inquirer', () => ({
	default: {
		prompt: jest.fn(),
		Separator: class Separator {
			constructor(value) {
				this.value = value;
			}
		},
	},
}));
