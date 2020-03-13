/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// @module HandlebarsExtra 'Handlebars.CompilerNameLookup' exports a function helper used in the templates to see if an object is a backbone model and access it
// using expressions like 'model.name'. See gulp/tasks/templates.js 'Handlebars.JavaScriptCompiler.prototype.nameLookup'.

define('Handlebars.CompilerNameLookup', [], function() {
	'use strict';

	/* globals Backbone */
	// heads up ! for separate templates from the rest of .js it is optimal that this file don't require backbone with AMD but globally.

	return function(parent, name) {
		if (parent instanceof Backbone.Model) {
			if (name === '__customFieldsMetadata') {
				return parent.__customFieldsMetadata;
			} else {
				return parent.get(name);
			}
		} else {
			return parent[name];
		}
	};
});
