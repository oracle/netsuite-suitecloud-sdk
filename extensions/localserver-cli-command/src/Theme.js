/*
** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const AbstractExtension = require('./AbstractExtension');
const Utils = require('./Utils');
const path = require('path');

module.exports = class Theme extends AbstractExtension {
	constructor(options) {
		super(options);

		this.PREFIX = 'commercetheme';
		this.rawExtension = this.rawExtension[this.PREFIX];

		this.basePath = this.rawExtension.basepath;
		this.vendor = this.rawExtension.vendor;
		this.name = this.rawExtension.name;
		this.version = this.rawExtension.version;

		this.overrides = {};
	}

	getTplOverrides() {
		return this._getOverrides('tpl');
	}

	getSassOverrides() {
		return this._getOverrides('scss');
	}

	_getOverrides(fileExt = 'all') {
		if (this.overrides[fileExt]) {
			return this.overrides[fileExt];
		}

		let overrides = this.rawExtension.overrides || {};

		overrides = overrides.override || overrides;

		if (!Object.keys(overrides).length) {
			return overrides;
		}

		overrides = Array.isArray(overrides) ? overrides : [overrides];

		overrides = overrides.map(override => {
			let dst = path.normalize(override.dst).split(path.sep);
			dst.shift();
			dst[dst.length - 1] = dst[dst.length - 1].replace(/^\_(.*)(\.scss)$/, '$1$2');

			return {
				src: Utils.parseFileName(override.src),
				dst: dst.join(path.sep),
			};
		});

		overrides = overrides.filter(override => {
			const regex = new RegExp(`\.${fileExt}$`);
			return fileExt === 'all' || regex.test(override.src);
		});
		const indexed = {};
		overrides.forEach(override => {
			indexed[override.dst] = override;
		});

		this.overrides[fileExt] = indexed;
		return this.overrides[fileExt];
	}
};
