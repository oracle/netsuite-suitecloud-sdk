'use strict';
const assert = require('assert');

const ACCOUNT_PARAMS = ['account', 'role', 'email', 'url'];

class CommandUtils {

	get INQUIRER_TYPES() {
		return {
			CHECKBOX: 'checkbox',
			INPUT: 'input',
			LIST: 'list',
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

		const commandOptions = Object.keys(commandMetadata.options)
		if (commandMetadata.isSetupRequired) {
			ACCOUNT_PARAMS.forEach(param => commandOptions.push(param))
		} 
		return this.extractKeysFromObject(answers, commandOptions);
	}

	quoteString(string) { 
		return `"${string}"`;
	}
};

module.exports =  new CommandUtils();