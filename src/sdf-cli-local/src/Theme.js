/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const AbstractExtension = require('./AbstractExtension');
const Utils = require('./Utils');
const _ = require('underscore');
const path = require('path');

module.exports = class Theme extends AbstractExtension {
	constructor(options) {
		super(options);

		this.PREFIX = 'commercetheme';
		this.raw_extension = this.raw_extension[this.PREFIX];

		this.base_path = this.raw_extension.basepath;
		this.vendor = this.raw_extension.vendor;
		this.name = this.raw_extension.name;
		this.version = this.raw_extension.version;

		this.overrides = {};
	}

	getTplOverrides() {
		return this._getOverrides('tpl');
	}

	getSassOverrides() {
		return this._getOverrides('scss');
	}

	_getOverrides(file_ext = 'all') {
		if (this.overrides[file_ext]) {
			return this.overrides[file_ext];
		}

		let overrides = this.raw_extension.overrides || {};

		overrides = overrides.override || overrides;

		if (_.isEmpty(overrides)) {
			return overrides;
		}

		overrides = _.isArray(overrides) ? overrides : [overrides];

		overrides = _.map(overrides, override => {
			let dst = path.normalize(override.dst).split(path.sep);
			dst.shift();
			dst[dst.length - 1] = dst[dst.length - 1].replace(/^\_(.*)(\.scss)$/, '$1$2');

			return {
				src: Utils.parseFileName(override.src),
				dst: dst.join(path.sep),
			};
		});

		overrides = _.filter(overrides, override => {
			const regex = new RegExp(`\.${file_ext}$`);
			return file_ext === 'all' || regex.test(override.src);
		});

		this.overrides[file_ext] = _.indexBy(overrides, 'dst');
		return this.overrides[file_ext];
	}
};
