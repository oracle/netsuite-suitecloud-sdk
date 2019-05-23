'use strict';
const assert = require('assert');

const INQUIRER_TYPES = {
	CHECKBOX: 'checkbox',
	INPUT: 'input',
	LIST: 'list',
}

const DefaultContextParamsArray = ['account', 'role', 'email', 'url'];

class CommandUtils {

	get INQUIRER_TYPES() {
		return INQUIRER_TYPES;
	}	

	extractKeysFromObject(object, keys) {
		return keys.reduce((obj, key) => {
			if (object[key]) {
				obj[key] = object[key];
			}
			return obj;
		}, {});
	}

	extractCommandOptionsBasedOnMetadata(object, commandMetadata) {
		assert(object);
		assert(commandMetadata);
		assert(commandMetadata.options);

		const keys = Object.keys(commandMetadata.options)
		if (commandMetadata.isSetupRequired) {
			DefaultContextParamsArray.forEach(param => keys.push(param))
		} 
		return this.extractKeysFromObject(object, keys);
	}

	quoteString(string) { 
		return `"${string}"`;
	}
};

module.exports =  new CommandUtils();