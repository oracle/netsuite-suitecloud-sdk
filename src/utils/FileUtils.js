'use strict';
const TranslationService = require('../services/TranslationService'); 
const { ERRORS } = require('../services/TranslationKeys'); 

const fs = require('fs');

module.exports = {
	create: function(fileName, object) {
		var content = JSON.stringify(object);

		fs.writeFileSync(fileName, content, 'utf8', function(error) {
			if (error) {
				throw TranslationService.getMessage(ERRORS.WRITNG_FILE, fileName, JSON.stringify(error));
			}
		});
	},

	readAsJson: function(fileName) {
		var content = fs.readFileSync(fileName, 'utf8');
		return JSON.parse(content);
	},
	readAsString: function(fileName) {
		var content = fs.readFileSync(fileName, 'utf8');
		return content;
	},
	exists: function(fileName) {
		return fs.existsSync(fileName);
	},
};
