/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class TemplatesCompiler {
	constructor(options) {
		this.context = options.context;
	}

	compile(resources) {
		resources = resources || this.context.getTemplates();

		return resources;
	}
};
