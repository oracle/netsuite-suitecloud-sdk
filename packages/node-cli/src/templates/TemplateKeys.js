/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const embeddedTemplates = require('./EmbeddedTemplates');

module.exports = {
	SCRIPTS: {
		blankscript: embeddedTemplates.blankscript,
	},
	OBJECTS: {
		commerceextension: embeddedTemplates.commerceextension,
	},
};
