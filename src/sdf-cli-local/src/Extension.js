/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const AbstractExtension = require('./AbstractExtension');
const Utils = require('./Utils');
const _ = require('underscore');

module.exports = class Extension extends AbstractExtension {
	constructor(options) {
		super(options);

		this.PREFIX = 'commerceextension';
		this.raw_extension = this.raw_extension[this.PREFIX];

		this.base_path = this.raw_extension.basepath;
		this.vendor = this.raw_extension.vendor;
		this.name = this.raw_extension.name;
		this.version = this.raw_extension.version;
	}

	getJavascript() {
		if (this.javascript) {
			return this.javascript;
		}
		this.javascript = { applications: {} };

		const javascript = this.raw_extension.javascript || {};
		const javascript_app = javascript.application || {};

		_.each(javascript_app, (js, app) => {
			this.javascript.applications[app] = Utils.parseFiles(js);
		});

		this.javascript.entrypoints = _.mapObject(javascript.entrypoints, Utils.parseFileName);

		return this.javascript;
	}
};
