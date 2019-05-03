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

		this.resources = {
			css: {
				tag: 'link',
				resource: 'css',
				url: `${protocol}://${host}/css/${app}.css`
			},
			define_patch: {
				tag: 'script',
				resource: 'define_patch',
				url: `${protocol}://${host}/define_patch.js`
			},
			requirejs: {
				tag: 'script',
				resource: 'requirejs',
				url: `${protocol}://${host}/javascript/require.js`
			},
			javascript_libs: {
				tag: 'script',
				resource: 'javascript_libs',
				url: 'javascript-libs.js'
			},
			templates: {
				tag: 'script',
				resource: 'templates',
				url: `${protocol}://${host}/templates/${app}-templates.js`
			},
			js_core: {
				tag: 'script',
				resource: 'js_core',
				url: null
			},
			js_extensions: {
				tag: 'script',
				resource: 'js_extensions',
				url: `${protocol}://${host}/extensions/${app}_ext.js`
			}
		}
	}

	setResponse() {

		const response = [
			this.resources.css, 
			this.resources.requirejs, 
			this.resources.define_patch, 
			this.resources.javascript_libs, 
			this.resources.templates, 
			this.resources.js_core, 
			this.resources.js_extensions
		];

		this.res.setHeader('Content-Type', 'application/json');
		this.res.json(response);
	}

};

module.exports = Who;