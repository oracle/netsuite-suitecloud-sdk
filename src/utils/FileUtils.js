'use strict';

const fs = require('fs');

module.exports = {
	create: function(fileName, object) {
		var content = JSON.stringify(object);

		fs.writeFileSync(fileName, content, 'utf8', function(error) {
			if (error) {
				throw `There was a problem while creating the file ${fileName} \n Error: ${JSON.stringify(
					error
				)}`;
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
