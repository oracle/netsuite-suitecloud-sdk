'use strict';

module.exports = class JavascriptCompiler {
	constructor(options) {
		this.context = options.context;
	}

	compile(resources) {
		resources = resources || this.context.getJavascript();

		return resources;
	}
};
