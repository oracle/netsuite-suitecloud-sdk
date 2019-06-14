'use strict';
const assert = require('assert');

class CommandUtils {
	get INQUIRER_TYPES() {
		return {
			CHECKBOX: 'checkbox',
			INPUT: 'input',
			LIST: 'list',
			PASSWORD: 'password'
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
}

module.exports = new CommandUtils();
