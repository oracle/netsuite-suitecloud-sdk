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
