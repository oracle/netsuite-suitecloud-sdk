/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { getControlFileAdapter } = require('../../../../sdk-core/build/services/project/adapters/ControlFileAdapterRegistry');

const EXPECTED_MANIFESTS = {
	suiteapp: {
		projectType: 'SUITEAPP', projectName: 'Sample App', publisherId: 'com.netsuite', projectId: 'sampleapp',
		projectVersion: '1.0.0',
	},
	acp: {
		projectType: 'ACCOUNTCUSTOMIZATION', projectName: 'Account Customization Project', publisherId: '', projectId: '',
		projectVersion: '',
	},
};

const EXPECTED_DEPLOYS = {
	suiteapp: {
		files: [
			'~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/setup.js',
			'~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/helper.js',
			'~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/*',
		],
		objects: ['~/Objects/customrecord_settings.xml', '~/Objects/customscript_setup.xml'],
		run: [
			{ path: '~/Objects/customscript_setup.xml', deployment: 'customdeploy_setup' },
			{ path: '~/Objects/customscript_defaults.xml', deployment: 'customdeploy_defaults' },
		],
		translationimports: ['~/Translations/custcollection_strings_fr_FR.xlf'],
		configurations: undefined,
	},
	acp: {
		files: ['~/FileCabinet/SuiteScripts/account-utility.js'],
		objects: ['~/Objects/customrecord_accountsettings.xml'],
		run: undefined,
		translationimports: ['~/Translations/custcollection_accountstrings_es_ES.xlf'],
		configurations: ['~/AccountConfiguration/features.xml', '~/AccountConfiguration/preferences.xml'],
	},
};

function parseControlFile(format, kind, contents) {
	const filename = `${kind}.${format}`;
	const adapter = getControlFileAdapter({ type: kind, fileName: filename, fileFormat: format });
	const document = adapter.parseDocument(contents, filename);
	const originalDocument = JSON.stringify(document);
	const normalized = kind === 'manifest'
		? adapter.normalizeManifest(document, filename)
		: adapter.normalizeDeploy(document, filename);
	return { document, originalDocument, normalized };
}

function defineProjectParsingTests(format, fixtures) {
	it('computes the application ID from the current manifest identity on demand', () => {
		const { normalized } = parseControlFile(format, 'manifest', fixtures.suiteapp.manifest);
		expect(normalized).not.toHaveProperty('applicationId');
		expect(normalized.getApplicationId()).toBe('com.netsuite.sampleapp');
		normalized.projectId = 'changed';
		expect(normalized.getApplicationId()).toBe('com.netsuite.changed');
	});

	it.each([
		[undefined, 'app'], ['com.example', undefined], ['', 'app'], ['com.example', ''], [undefined, undefined],
	])('returns undefined for incomplete application identity: %j, %j', (publisherId, projectId) => {
		const { normalized } = parseControlFile(format, 'manifest', fixtures.suiteapp.manifest);
		normalized.publisherId = publisherId;
		normalized.projectId = projectId;
		expect(normalized.getApplicationId()).toBeUndefined();
	});

	describe.each(['suiteapp', 'acp'])('%s manifest and deploy', (projectType) => {
		const { manifest, deploy } = fixtures[projectType];
		const frameworkVersion = format === 'xml' ? '1.0' : '2.0';

		it('normalizes manifest identity without changing the parsed document', () => {
			const { document, originalDocument, normalized } = parseControlFile(format, 'manifest', manifest);
			expect(normalized).toEqual({
				...EXPECTED_MANIFESTS[projectType], frameworkVersion,
				dependencies: undefined,
				getApplicationId: expect.any(Function),
			});
			expect(JSON.stringify(document)).toBe(originalDocument);
		});

		it('preserves path and script order within each supported section without changing the parsed document', () => {
			const { document, originalDocument, normalized } = parseControlFile(format, 'deploy', deploy);
			expect(normalized).toEqual(EXPECTED_DEPLOYS[projectType]);
			expect(JSON.stringify(document)).toBe(originalDocument);
		});
	});
}

function defineStructuredControlFileTests(format) {
	it.each([
		['manifest', [], '/'],
		['manifest', null, '/'],
		['manifest', {}, '/'],
		['manifest', { manifest: [] }, '/manifest'],
		['manifest', { manifest: null }, '/manifest'],
		['manifest', { manifest: 'invalid' }, '/manifest'],
		['deploy', {}, '/'],
		['deploy', { deploy: null }, '/deploy'],
		['deploy', { deploy: {} }, '/deploy'],
		['deploy', { deploy: ['files'] }, '/deploy/0'],
		['deploy', { deploy: [null] }, '/deploy/0'],
		['deploy', { deploy: [{}] }, '/deploy/0'],
		['deploy', { deploy: [{ files: {}, objects: {} }] }, '/deploy/0'],
		['deploy', { deploy: [{ files: 'invalid' }] }, '/deploy/0/files'],
		['deploy', { deploy: [{ files: [] }] }, '/deploy/0/files'],
		['deploy', { deploy: [{ 'custom/group~name': null }] }, '/deploy/0/custom~1group~0name'],
		['deploy', { deploy: [{ run: { script: ['invalid'] } }] }, '/deploy/0/run/script/0'],
	])('reports an unreadable %s control file with its property location (case %#)', (kind, document, propertyPath) => {
		// JSON is also valid YAML; these cases exercise the shared structure contract through both parsers.
		expect(() => parseControlFile(format, kind, JSON.stringify(document)))
			.toThrow(`Invalid ${kind}.${format} at ${propertyPath}:`);
	});

	it('preserves singleton selections and empty paths', () => {
		const { normalized } = parseControlFile(format, 'deploy', JSON.stringify({ deploy: [
			{ objects: { path: '~/Objects/*' } },
			{ run: { script: { path: '~/Objects/install.xml', deployment: 'customdeploy_install' } } },
			{ files: { path: [] } },
		] }));
		expect(normalized).toEqual({
			files: [], objects: ['~/Objects/*'],
			run: [{ path: '~/Objects/install.xml', deployment: 'customdeploy_install' }],
			translationimports: undefined, configurations: undefined,
		});
	});

	it('accepts an empty deploy array while content validation is deferred', () => {
		expect(parseControlFile(format, 'deploy', '{"deploy": []}').normalized).toEqual({});
	});

	it.each(['1.0', '2.0', '2.0.0', undefined])('leaves framework-version validation deferred: %s', (frameworkversion) => {
		const { normalized } = parseControlFile(format, 'manifest', JSON.stringify({
			manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion },
		}));
		expect(normalized.frameworkVersion).toBe(frameworkversion ?? '');
	});
}

module.exports = { parseControlFile, defineProjectParsingTests, defineStructuredControlFileTests };
