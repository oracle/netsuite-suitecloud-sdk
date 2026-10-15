/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { parseControlFile } = require('./helpers/ControlFileAdapterAssertions');

describe.each(['xml', 'json', 'yaml', 'yml'])('manifest.%s dependencies', (format) => {
	function normalize(dependencies, xml) {
		const contents = format === 'xml'
			? `<manifest projecttype="SUITEAPP"><frameworkversion>1.0</frameworkversion>${xml ?? ''}</manifest>`
			: JSON.stringify({ manifest: { projecttype: 'SUITEAPP', frameworkversion: '2.0', dependencies } });
		return parseControlFile(format, 'manifest', contents).normalized;
	}

	it('preserves absent dependencies and empty collections', () => {
		expect(normalize().dependencies).toBeUndefined();
		expect(normalize({}, '<dependencies/>').dependencies).toEqual({});
		const dependencies = { features: [], applications: [], bundles: [], files: [], folders: [], objects: [], platformextensions: [] };
		const xml = '<dependencies><features/><applications/><bundles/><files/><folders/><objects/><platformextensions/></dependencies>';
		expect(normalize(dependencies, xml).dependencies).toEqual(dependencies);
	});

	it('keeps account, application, and bundle dependencies in their declared locations', () => {
		const dependencies = {
			objects: ['customrecord_account'],
			files: ['/SuiteScripts/helper.js'],
			folders: ['/SuiteScripts/'],
			platformextensions: ['com.example.account'],
			applications: [{
				id: 'com.example.app', objects: ['customrecord_application'],
				platformextensions: ['com.example.application'],
			}],
			bundles: [
				{ id: '100|200|300' },
				{ id: '351', objects: ['customrecord_car.custrecord_wheel', 'customrecord_train'] },
				{ id: '352', objects: [] },
			],
		};
		const xml = '<dependencies><objects><object>customrecord_account</object></objects>' +
			'<files><file>/SuiteScripts/helper.js</file></files><folders><folder>/SuiteScripts/</folder></folders>' +
			'<platformextensions><platformextension>com.example.account</platformextension></platformextensions>' +
			'<applications><application id="com.example.app"><objects><object>customrecord_application</object></objects>' +
			'<platformextensions><platformextension>com.example.application</platformextension></platformextensions>' +
			'</application></applications><bundles><bundle id="100|200|300"/><bundle id="351"><objects>' +
			'<object>customrecord_car.custrecord_wheel</object><object>customrecord_train</object></objects></bundle>' +
			'<bundle id="352"><objects/></bundle></bundles></dependencies>';
		expect(normalize(dependencies, xml).dependencies).toEqual(dependencies);
	});

	it('preserves application order, repeated features, and empty object arrays', () => {
		const dependencies = {
			features: [{ name: 'CUSTOMRECORDS', required: 'true' }, { name: 'CUSTOMRECORDS', required: 'false' }],
			applications: [{ id: 'com.example.first', objects: [] }, { id: 'com.example.second' }],
		};
		const xml = '<dependencies><features><feature required="true">CUSTOMRECORDS</feature>' +
			'<feature required="false">CUSTOMRECORDS</feature></features><applications>' +
			'<application id="com.example.first"><objects/></application>' +
			'<application id="com.example.second"/></applications></dependencies>';
		expect(normalize(dependencies, xml).dependencies).toEqual({
			...dependencies,
			features: [{ name: 'CUSTOMRECORDS', required: true }, { name: 'CUSTOMRECORDS', required: false }],
		});
	});

	it.each(['yes', '', 'TRUE'])('rejects an invalid feature requirement: %j', (required) => {
		expect(() => normalize({ features: [{ name: 'CUSTOMRECORDS', required }] },
			`<dependencies><features><feature required="${required}">CUSTOMRECORDS</feature></features></dependencies>`))
			.toThrow(`Invalid manifest.${format} at /manifest/dependencies/features/0/required:`);
	});
});

describe.each(['json', 'yaml', 'yml'])('manifest.%s dependency structure', (format) => {
	it('accepts native boolean feature requirements', () => {
		const dependencies = { features: [{ name: 'FEATURE', required: false }] };
		expect(parseControlFile(format, 'manifest', JSON.stringify({ manifest: { dependencies } })).normalized.dependencies)
			.toEqual(dependencies);
	});

	it.each([
		[null, '/manifest/dependencies'],
		[[], '/manifest/dependencies'],
		[{ features: {} }, '/manifest/dependencies/features'],
		[{ features: [null] }, '/manifest/dependencies/features/0'],
		[{ features: [{ name: 'FEATURE' }] }, '/manifest/dependencies/features/0/required'],
		[{ features: [{ name: 1, required: 'true' }] }, '/manifest/dependencies/features/0/name'],
		[{ applications: [{ id: 1 }] }, '/manifest/dependencies/applications/0/id'],
		[{ applications: [{ id: 'com.example.app', objects: [false] }] }, '/manifest/dependencies/applications/0/objects/0'],
		[{ files: 'file.js' }, '/manifest/dependencies/files'],
	])('rejects malformed dependencies (case %#)', (dependencies, path) => {
		expect(() => parseControlFile(format, 'manifest', JSON.stringify({ manifest: { dependencies } })))
			.toThrow(`Invalid manifest.${format} at ${path}:`);
	});
});
