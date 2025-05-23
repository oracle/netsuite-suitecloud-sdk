/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
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
		cliconfig: require.resolve('./projectconfigs/suitecloud.config.js'),
		gitignore: require.resolve('./projectconfigs/default_gitignore'),
	},
	UNIT_TEST: {
		cliconfig: require.resolve('./unittest/suitecloud.config.js.template'),
		jestconfig: require.resolve('./unittest/jest.config.js.template'),
		packagejson: require.resolve('./unittest/package.json.template'),
		sampletest: require.resolve('./unittest/sample-test.js.template'),
		jsconfig: require.resolve('./unittest/jsconfig.json.template'),
	},
	SPA_PROJECT: {
		spaclient: require.resolve('./spaproject/spaclient.tsx.template'),
		spaserver: require.resolve('./spaproject/spaserver.ts.template'),
		helloworld: require.resolve('./spaproject/helloworld.tsx.template'),
		custspa: require.resolve('./spaproject/custspa_projectname.xml.template'),
		eslint: require.resolve('./spaproject/eslint.config.mjs.template'),
		gulpfile: require.resolve('./spaproject/gulpfile.mjs.template'),
		package: require.resolve('./spaproject/package.json.template'),
		tsconfig: require.resolve('./spaproject/tsconfig.json.template'),
		tsconfigtest: require.resolve('./spaproject/tsconfig.test.json.template'),
	},
};
