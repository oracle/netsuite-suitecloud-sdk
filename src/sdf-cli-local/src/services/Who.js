'use strict';

class Who {

	constructor(req, res){

		this.req = req;
		this.res = res;

		this.setResources();
		this.setResponse();
	}

	setResources(){
		
		const protocol = this.req.protocol;
		const host = this.req.get('host');
		const app = this.req.params.app;

		this.css = {
			tag: 'link', 
			resource: 'css', 
			url: `${protocol}://${host}/css/${app}.css`
		};
		this.define_patch = {
			tag: 'script', 
			resource: 'define_patch', 
			url: `${protocol}://${host}/define_patch.js`
		};
		this.requirejs = {
			tag: 'script', 
			resource: 'requirejs', 
			url: `${protocol}://${host}/javascript/require.js`
		};
		this.javascript_libs = {
			tag: 'script', 
			resource: 'javascript_libs', 
			url: `${protocol}://${host}/javascript-libs.js`
		};
		this.templates = {
			tag: 'script', 
			resource: 'templates', 
			url: `${protocol}://${host}/${app}-templates.js`
		};
		this.js_core = {
			tag: 'script', 
			resource: 'js_core', 
			url: `${protocol}://${host}/javascript/${app}.js`
		};
		this.js_extensions = {
			tag: 'script', 
			resource: 'js_extensions', 
			url: `${protocol}://${host}/extensions/${app}_ext.js`
		};
	}

	setResponse() {

		const response = [
			this.css, 
			this.requirejs, 
			this.define_patch, 
			this.templates, 
			this.javascript_libs, 
			this.js_core, 
			this.js_extensions
		];

		this.res.setHeader('Content-Type', 'application/json');
		this.res.json(response);
	}

};

module.exports = Who;