/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');

class CommandUtils {
	get INQUIRER_TYPES() {
		return {
			CHECKBOX: 'checkbox',
			INPUT: 'input',
			LIST: 'list',
			PASSWORD: 'password',
			PASSWORD_MASK: '*',
		};
	}

	extractKeysFromObject(object, keys) {
		return keys.reduce((obj, key) => {
			if (object[key]) {
				obj[key] = object[key];
			}
			return obj;
		}, {});
	}

	extractCommandOptions(answers, commandMetadata) {
		assert(answers);
		assert(commandMetadata);
		assert(commandMetadata.options);

		const commandOptions = Object.keys(commandMetadata.options);
		return this.extractKeysFromObject(answers, commandOptions);
	}

	quoteString(string) {
		return `"${string}"`;
	}

	unquoteString(stringValue) {
		if (stringValue.length > 1 && stringValue.startsWith('"') && stringValue.endsWith('"')) {
			return stringValue.slice(1, -1);
		}
		return stringValue;
	}
}

module.exports = new CommandUtils();
