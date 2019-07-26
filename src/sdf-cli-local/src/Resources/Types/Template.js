/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
const Utils = require('../../Utils');
const Resource = require('../Resource');

module.exports = class Template extends Resource {
	constructor(options) {
		super(options);

		this.precompiled = '';
		this.format = '.tpl';
		this.extension_asset_url = options.extension_asset_url;
	}

	getDependencies() {
		const dependencies = [`'Handlebars'`, `'Handlebars.CompilerNameLookup'`];
		const regex = /data-\w*\-{0,1}template=\"([^"]+)\"/gm;

		let result;
		while ((result = regex.exec(this.content))) {
			dependencies.push(`'${result[1]}.tpl'`);
		}
		return Utils.arrayUnion(dependencies);
	}

	setPrecomplied(value) {
		this.precompiled = value;
	}
};
