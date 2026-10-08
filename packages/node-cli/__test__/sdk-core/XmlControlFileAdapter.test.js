/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { parseControlFile, defineProjectParsingTests } = require('./helpers/ControlFileAdapterAssertions');

// XML equivalents of the JSON/YAML examples retain attributes and dependency wrappers.
const fixtures = {
	suiteapp: {
		manifest: `<manifest projecttype="SUITEAPP">
  <frameworkversion>1.0</frameworkversion>
  <publisherid>com.netsuite</publisherid>
  <projectid>sampleapp</projectid>
  <projectname> Sample App </projectname>
  <projectversion>1.0.0</projectversion>
  <description>Example SuiteApp manifest</description>
  <dependencies>
    <features>
      <feature required="true">CUSTOMRECORD</feature>
      <feature required="false">MULTILANGUAGE</feature>
    </features>
    <bundles>
      <bundle id="123|456"><objects><object>customrecord_shared</object></objects></bundle>
    </bundles>
    <applications>
      <application id="com.netsuite.shared">
        <objects><object>customrecord_shared</object></objects>
        <platformextensions><platformextension>com.netsuite.extension</platformextension></platformextensions>
      </application>
    </applications>
  </dependencies>
</manifest>`,
		deploy: `<deploy>
  <files>
    <path>~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/setup.js</path>
    <path>~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/helper.js</path>
  </files>
  <run>
    <script><path>~/Objects/customscript_setup.xml</path><deployment>customdeploy_setup</deployment></script>
    <script><path>~/Objects/customscript_defaults.xml</path><deployment>customdeploy_defaults</deployment></script>
  </run>
  <objects>
    <path>~/Objects/customrecord_settings.xml</path>
    <path>~/Objects/customscript_setup.xml</path>
  </objects>
  <files><path>~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/*</path></files>
  <translationimports><path>~/Translations/custcollection_strings_fr_FR.xlf</path></translationimports>
</deploy>`,
	},
	acp: {
		manifest: `<manifest projecttype="ACCOUNTCUSTOMIZATION">
  <frameworkversion>1.0</frameworkversion>
  <projectname>Account Customization Project</projectname>
  <description>Example account customization project</description>
  <dependencies>
    <objects><object>customrecord_settings</object></objects>
    <files><file>/SuiteScripts/acp-helper.js</file></files>
    <folders><folder>/SuiteScripts/</folder></folders>
    <platformextensions><platformextension>com.netsuite.extension</platformextension></platformextensions>
    <applications>
      <application id="com.netsuite.shared"><objects><object>customrecord_shared</object></objects></application>
    </applications>
  </dependencies>
</manifest>`,
		deploy: `<deploy>
  <configuration><path>~/AccountConfiguration/features.xml</path></configuration>
  <configuration><path>~/AccountConfiguration/preferences.xml</path></configuration>
  <files><path>~/FileCabinet/SuiteScripts/account-utility.js</path></files>
  <objects><path>~/Objects/customrecord_accountsettings.xml</path></objects>
  <translationimports><path>~/Translations/custcollection_accountstrings_es_ES.xlf</path></translationimports>
</deploy>`,
	},
};

describe('XML control-file adapter', () => {
	defineProjectParsingTests('xml', fixtures);

	it('retains SuiteApp feature attributes, bundles, and application dependencies', () => {
		const { document } = parseControlFile('xml', 'manifest', fixtures.suiteapp.manifest);
		expect(document.manifest.dependencies).toMatchObject({
			features: { feature: [{ _: 'CUSTOMRECORD', $: { required: 'true' } }, { _: 'MULTILANGUAGE', $: { required: 'false' } }] },
			bundles: { bundle: { $: { id: '123|456' }, objects: { object: 'customrecord_shared' } } },
			applications: { application: {
				$: { id: 'com.netsuite.shared' }, objects: { object: 'customrecord_shared' },
				platformextensions: { platformextension: 'com.netsuite.extension' },
			} },
		});
	});

	it('retains ACP file, folder, object, and application dependency declarations', () => {
		const { document } = parseControlFile('xml', 'manifest', fixtures.acp.manifest);
		expect(document.manifest.dependencies).toMatchObject({
			objects: { object: 'customrecord_settings' }, files: { file: '/SuiteScripts/acp-helper.js' },
			folders: { folder: '/SuiteScripts/' }, platformextensions: { platformextension: 'com.netsuite.extension' },
			applications: { application: { $: { id: 'com.netsuite.shared' }, objects: { object: 'customrecord_shared' } } },
		});
	});

	it.each(['manifest', 'deploy'])('rejects a wrong %s root during normalization', (kind) => {
		expect(() => parseControlFile('xml', kind, '<other/>'))
			.toThrow(`Invalid ${kind}.xml: expected <${kind}> as the root element.`);
	});

	it.each(['manifest', 'deploy'])('rejects malformed or empty %s XML with the filename', (kind) => {
		for (const contents of ['', `<${kind}>`, `<${kind}></other>`]) {
			expect(() => parseControlFile('xml', kind, contents)).toThrow(`Invalid ${kind}.xml`);
		}
	});

	it('accepts an empty deploy root while content validation is deferred', () => {
		expect(parseControlFile('xml', 'deploy', '<deploy/>').normalized).toEqual([]);
	});
});
