'use strict';

module.exports = {
	INQUIRER_TYPES: {
		CHECKBOX: 'checkbox',
		INPUT: 'input',
		LIST: 'list',
	},
	extractOnlyOptionsFromObject: function(object, keys) {
		return keys.reduce((obj, key) => {
			if (object[key]) {
				obj[key] = object[key];
			}
			return obj;
		}, {});
	}
};


