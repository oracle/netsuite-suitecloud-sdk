/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { parseControlFile, defineProjectParsingTests, defineStructuredControlFileTests } = require('./helpers/ControlFileAdapterAssertions');

// Based on the Distribution control-file examples and JsonControlFileParserUnitTest.
const fixtures = {
	suiteapp: {
		manifest: `{
  "manifest": {
    "projecttype": "SUITEAPP",
    "frameworkversion": "2.0",
    "publisherid": "com.netsuite",
    "projectid": "sampleapp",
    "projectname": " Sample App ",
    "projectversion": "1.0.0",
    "description": "Example SuiteApp manifest",
    "dependencies": {
      "features": [
        {"name": "CUSTOMRECORD", "required": "true"},
        {"name": "MULTILANGUAGE", "required": "false"}
      ],
      "bundles": [{"id": "123|456", "objects": ["customrecord_shared"]}],
      "applications": [{
        "id": "com.netsuite.shared",
        "objects": ["customrecord_shared"],
        "platformextensions": ["com.netsuite.extension"]
      }]
    }
  }
}`,
		deploy: `{
  "deploy": [
    {"files": {"path": [
      "~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/setup.js",
      "~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/helper.js"
    ]}},
    {"run": {"script": [
      {"path": "~/Objects/customscript_setup.xml", "deployment": "customdeploy_setup"},
      {"path": "~/Objects/customscript_defaults.xml", "deployment": "customdeploy_defaults"}
    ]}},
    {"objects": {"path": ["~/Objects/customrecord_settings.xml", "~/Objects/customscript_setup.xml"]}},
    {"files": {"path": ["~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/*"]}},
    {"translationimports": {"path": ["~/Translations/custcollection_strings_fr_FR.xlf"]}}
  ]
}`,
	},
	acp: {
		manifest: `{
  "manifest": {
    "projecttype": "ACCOUNTCUSTOMIZATION",
    "frameworkversion": "2.0",
    "projectname": "Account Customization Project",
    "description": "Example account customization project",
    "dependencies": {
      "objects": ["customrecord_settings"],
      "files": ["/SuiteScripts/acp-helper.js"],
      "folders": ["/SuiteScripts/"],
      "platformextensions": ["com.netsuite.extension"],
      "applications": [{"id": "com.netsuite.shared", "objects": ["customrecord_shared"]}]
    }
  }
}`,
		deploy: `{
  "deploy": [
    {"configuration": {"path": ["~/AccountConfiguration/features.xml"]}},
    {"configuration": {"path": ["~/AccountConfiguration/preferences.xml"]}},
    {"files": {"path": ["~/FileCabinet/SuiteScripts/account-utility.js"]}},
    {"objects": {"path": ["~/Objects/customrecord_accountsettings.xml"]}},
    {"translationimports": {"path": ["~/Translations/custcollection_accountstrings_es_ES.xlf"]}}
  ]
}`,
	},
};

describe('JSON control-file adapter', () => {
	defineProjectParsingTests('json', fixtures);
	defineStructuredControlFileTests('json');

	it.each(['manifest', 'deploy'])('rejects malformed %s JSON with the filename', (kind) => {
		for (const contents of ['{', `{"${kind}": {},}`, `{"${kind}": {}} trailing`, `{/*comment*/"${kind}": {}}`]) {
			expect(() => parseControlFile('json', kind, contents)).toThrow(`Invalid ${kind}.json:`);
		}
	});
});
