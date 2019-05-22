'use strict';

module.exports = {
	INQUIRER_TYPES: {
		CHECKBOX: 'checkbox',
		INPUT: 'input',
		LIST: 'list',
		PASSWORD: 'password'
	},
	extractOnlyOptionsFromObject: function(object, keys) {
		return keys.reduce((obj, key) => {
			if (object[key]) {
				obj[key] = object[key];
			}
			return obj;
		}, {});
	},
	quoteString: string => `"${string}"`,
};


