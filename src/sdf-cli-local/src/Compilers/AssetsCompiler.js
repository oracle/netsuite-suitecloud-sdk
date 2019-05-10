'use strict';

module.exports = class AssetsCompiler {
	constructor(options) {
		this.context = options.context;
	}

	compile(resources) {
		resources = resources || this.context.getAssets();

		return resources;
	}
};
