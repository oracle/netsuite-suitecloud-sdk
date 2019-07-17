const _ = require('underscore');
const Utils = require('../../Utils');
const Resource = require('../Resource');

module.exports = class Javascript extends Resource {
	constructor(options) {
		super(options);

		this.isEntrypoint = !!options.isEntrypoint;
		this.format = '.js';
		this.extension_fullname = options.extension_fullname;
	}
};
