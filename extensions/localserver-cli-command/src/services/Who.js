/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = function(req, res) {
	const protocol = req.protocol;
	const host = req.get('host');
	const app = req.params.app;

	const resources = {
		css: {
			tag: 'link',
			resource: 'css',
			url: `${protocol}://${host}/css/${app}.css`,
		},
		requirejs: {
			tag: 'script',
			resource: 'requirejs',
			url: `${protocol}://${host}/require.js`,
		},
		define_patch: {
			tag: 'script',
			resource: 'define_patch',
			url: `${protocol}://${host}/define_patch.js`,
		},
		javascript_libs: {
			tag: 'script',
			resource: 'javascript_libs',
			url: `${protocol}://${host}/templates/javascript-libs.js`,
		},
		templates: {
			tag: 'script',
			resource: 'templates',
			url: `${protocol}://${host}/templates/${app}-templates.js`,
		},
		js_core: {
			tag: 'script',
			resource: 'js_core',
			url: null,
		},
		js_extensions: {
			tag: 'script',
			resource: 'js_extensions',
			url: `${protocol}://${host}/javascript/${app}_ext.js`,
		},
	};

	const response = Object.values(resources);

	res.setHeader('Content-Type', 'application/json');
	res.json(response);
};
