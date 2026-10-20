/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { getControlFileAdapter } = require('../../../sdk-core/build/services/project/adapters/ControlFileAdapterRegistry');
const { parseControlFile, defineProjectParsingTests, defineStructuredControlFileTests } = require('./helpers/ControlFileAdapterAssertions');

// Use native YAML for both project types, including direct dependency lists.
const fixtures = {
	suiteapp: {
		manifest: `manifest:
  projecttype: SUITEAPP
  frameworkversion: "2.0"
  publisherid: com.netsuite
  projectid: sampleapp
  projectname: ' Sample App '
  projectversion: "1.0.0"
  description: Example SuiteApp manifest
  dependencies:
    features:
      - name: CUSTOMRECORD
        required: "true"
      - name: MULTILANGUAGE
        required: "false"
    bundles:
      - id: "123|456"
        objects:
          - customrecord_shared
    applications:
      - id: com.netsuite.shared
        objects:
          - customrecord_shared
        platformextensions:
          - com.netsuite.extension
`,
		deploy: `deploy:
  - files:
      path:
        - "~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/setup.js"
        - "~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/helper.js"
  - run:
      script:
        - path: "~/Objects/customscript_setup.xml"
          deployment: customdeploy_setup
        - path: "~/Objects/customscript_defaults.xml"
          deployment: customdeploy_defaults
  - objects:
      path:
        - "~/Objects/customrecord_settings.xml"
        - "~/Objects/customscript_setup.xml"
  - files:
      path:
        - "~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/*"
  - translationimports:
      path:
        - "~/Translations/custcollection_strings_fr_FR.xlf"
`,
	},
	acp: {
		manifest: `manifest:
  projecttype: ACCOUNTCUSTOMIZATION
  frameworkversion: "2.0"
  projectname: Account Customization Project
  description: Example account customization project
  dependencies:
    objects:
      - customrecord_settings
    files:
      - /SuiteScripts/acp-helper.js
    folders:
      - /SuiteScripts/
    platformextensions:
      - com.netsuite.extension
    applications:
      - id: com.netsuite.shared
        objects:
          - customrecord_shared
`,
		deploy: `deploy:
  - configuration:
      path:
        - "~/AccountConfiguration/features.xml"
  - configuration:
      path:
        - "~/AccountConfiguration/preferences.xml"
  - files:
      path:
        - "~/FileCabinet/SuiteScripts/account-utility.js"
  - objects:
      path:
        - "~/Objects/customrecord_accountsettings.xml"
  - translationimports:
      path:
        - "~/Translations/custcollection_accountstrings_es_ES.xlf"
`,
	},
};

describe('YAML control-file adapter', () => {
	const format = 'yaml';
	defineProjectParsingTests(format, fixtures);
	defineStructuredControlFileTests(format);

	it.each(['manifest', 'deploy'])('rejects invalid or ambiguous %s YAML with the filename', (kind) => {
		for (const contents of [
			`${kind}: [unfinished`,
			`${kind}: {}\n${kind}: {}`,
			`${kind}: {}\n---\n${kind}: {}`,
			`${kind}: *missing`,
			'? [a, b]\n: value',
		]) {
			expect(() => parseControlFile(format, kind, contents)).toThrow(`Invalid ${kind}.${format}:`);
		}
	});

	it('rejects duplicate group properties within a deploy item', () => {
		expect(() => parseControlFile(format, 'deploy', `deploy:
  - files:
      path: ["~/FileCabinet/first.js"]
    files:
      path: ["~/FileCabinet/second.js"]
`)).toThrow(`Invalid deploy.${format}:`);
	});

	it('supports comments and anchors while preserving repeated groups', () => {
		const { normalized } = parseControlFile(format, 'deploy', `deploy:
  - files: &files # a shared selection
      path: ["~/FileCabinet/first.js"]
  - files: *files
`);
		expect(normalized.files)
			.toEqual(['~/FileCabinet/first.js', '~/FileCabinet/first.js']);
	});

	it('limits alias expansion', () => {
		const aliases = Array.from({ length: 101 }, () => '*files').join(', ');
		expect(() => parseControlFile(format, 'deploy', `files: &files [first, second]\ndeploy: [${aliases}]`))
			.toThrow(`Invalid deploy.${format}:`);
	});

	it('preserves quoted versions and YAML 1.2 scalar types', () => {
		const { document, normalized } = parseControlFile(format, 'manifest', fixtures.suiteapp.manifest);
		expect(document.manifest.frameworkversion).toBe('2.0');
		expect(normalized.projectVersion).toBe('1.0.0');
		const adapter = getControlFileAdapter({ type: 'manifest', fileName: `manifest.${format}`, fileFormat: format });
		expect(adapter.parseDocument('manifest:\n  projectname: on\n  frameworkversion: 2.0', `manifest.${format}`).manifest)
			.toEqual({ projectname: 'on', frameworkversion: 2 });
	});
});

// Both extensions use the YAML parser; exercise the alias without duplicating its full contract.
it('supports native YAML control files with the .yml extension', () => {
	expect(parseControlFile('yml', 'manifest', fixtures.suiteapp.manifest).normalized)
		.toMatchObject({ projectType: 'SUITEAPP', frameworkVersion: '2.0' });
	expect(parseControlFile('yml', 'deploy', fixtures.suiteapp.deploy).normalized.files)
		.toHaveLength(3);
});
