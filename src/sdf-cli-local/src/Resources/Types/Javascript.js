/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
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
