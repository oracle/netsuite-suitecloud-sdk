'use strict';

const Config = require('../configuration/Config');

module.exports = {
	getConfig: function() {
		try {
			const LocalConfig = require('../configuration/LocalConfig');
			return { ...Config, ...LocalConfig };
		} catch (ex) {
			return Config;
		}
	},
};
