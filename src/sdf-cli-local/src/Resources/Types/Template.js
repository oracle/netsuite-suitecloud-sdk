const _ = require('underscore');
const Utils = require('../../Utils');
const Resource = require('../Resource');

module.exports = class Template extends Resource {
	constructor(options) {
		super(options);

		this.content = '';
		this.precompiled = '';
		this.format = '.js';
	}

	sourceContent() {
		return Utils.getFileContent(this.fullsrc()).then(content => {
			return (this.content = content);
		});
	}

	getDependencies() {
		const dependencies = [`'Handlebars'`, `'Handlebars.CompilerNameLookup'`];
		const regex = /data-\w*\-{0,1}template=\"([^"]+)\"/gm;

		let result;
		while ((result = regex.exec(this.content))) {
			dependencies.push(`'${result[1]}.tpl'`);
		}
		return _.uniq(dependencies);
	}

	setPrecomplied(value) {
		this.precompiled = value;
	}
};
