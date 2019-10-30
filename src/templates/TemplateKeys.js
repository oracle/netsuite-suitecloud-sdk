/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = {
	SCRIPTS: {
		blankscript: require.resolve('./scripts/blankscript.js'),
	},
	OBJECTS: {
		commerceextension: require.resolve('./objects/commerceextension.xml'),
	},
	PROJECTCONFIGS: {
		cliconfig: require.resolve('./projectconfigs/cli-config.js'),
	},
	UNIT_TEST: {
		cliconfig: require.resolve('./unittest/cli-config.js.template'),
		jestconfig: require.resolve('./unittest/jest.config.js.template'),
		packagejson: require.resolve('./unittest/package.json.template'),
		sampletest: require.resolve('./unittest/sample-test.js.template'),
	}
};
