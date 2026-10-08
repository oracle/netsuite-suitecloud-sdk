/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { getControlFileAdapter } = require('../../../../sdk-core/build/services/project/ControlFileAdapterRegistry');
const { getProjectManifestFile, inspectControlFilesAndGetProjectDescription } = require('@oracle/suitecloud-sdk-core').services;

const EXPECTED_MANIFESTS = {
	suiteapp: {
		projectType: 'SUITEAPP', projectName: 'Sample App', publisherId: 'com.netsuite', projectId: 'sampleapp',
		applicationId: 'com.netsuite.sampleapp', projectVersion: '1.0.0',
	},
	acp: {
		projectType: 'ACCOUNTCUSTOMIZATION', projectName: 'Account Customization Project', publisherId: '', projectId: '',
		applicationId: undefined, projectVersion: '',
	},
};

const EXPECTED_DEPENDENCIES = {
	suiteapp: {
		features: [{ name: 'CUSTOMRECORD', required: 'true' }, { name: 'MULTILANGUAGE', required: 'false' }],
		bundles: [{ id: '123|456', objects: ['customrecord_shared'] }],
		applications: [{ id: 'com.netsuite.shared', objects: ['customrecord_shared'], platformextensions: ['com.netsuite.extension'] }],
	},
	acp: {
		objects: ['customrecord_settings'], files: ['/SuiteScripts/acp-helper.js'], folders: ['/SuiteScripts/'],
		platformextensions: ['com.netsuite.extension'],
		applications: [{ id: 'com.netsuite.shared', objects: ['customrecord_shared'] }],
	},
};

const EXPECTED_DEPLOY_GROUPS = {
	suiteapp: [
		{ kind: 'files', paths: ['~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/setup.js',
			'~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/helper.js'], scripts: [] },
		{ kind: 'run', paths: [], scripts: [
			{ path: '~/Objects/customscript_setup.xml', deployment: 'customdeploy_setup' },
			{ path: '~/Objects/customscript_defaults.xml', deployment: 'customdeploy_defaults' },
		] },
		{ kind: 'objects', paths: ['~/Objects/customrecord_settings.xml', '~/Objects/customscript_setup.xml'], scripts: [] },
		{ kind: 'files', paths: ['~/FileCabinet/SuiteApps/com.netsuite.sampleapp/Scripts/*'], scripts: [] },
		{ kind: 'translationimports', paths: ['~/Translations/custcollection_strings_fr_FR.xlf'], scripts: [] },
	],
	acp: [
		{ kind: 'configuration', paths: ['~/AccountConfiguration/features.xml'], scripts: [] },
		{ kind: 'configuration', paths: ['~/AccountConfiguration/preferences.xml'], scripts: [] },
		{ kind: 'files', paths: ['~/FileCabinet/SuiteScripts/account-utility.js'], scripts: [] },
		{ kind: 'objects', paths: ['~/Objects/customrecord_accountsettings.xml'], scripts: [] },
		{ kind: 'translationimports', paths: ['~/Translations/custcollection_accountstrings_es_ES.xlf'], scripts: [] },
	],
};

function parseControlFile(format, kind, contents) {
	const filename = `${kind}.${format}`;
	const adapter = getControlFileAdapter({ kind, filename, format });
	const document = adapter.parseDocument(contents, filename);
	const originalDocument = JSON.stringify(document);
	const normalized = kind === 'manifest'
		? adapter.normalizeManifest(document, filename)
		: adapter.normalizeDeploy(document, filename);
	return { document, originalDocument, normalized };
}

function assertDeployValues(groups, projectType) {
	expect(groups.map((group) => ({
		kind: group.kind,
		paths: group.paths.map((path) => path.value),
		scripts: group.scripts.map((script) => ({ path: script.path.value, deployment: script.deployment })),
	}))).toEqual(EXPECTED_DEPLOY_GROUPS[projectType]);
}

function defineProjectParsingTests(format, fixtures) {
	describe.each(['suiteapp', 'acp'])('%s manifest and deploy', (projectType) => {
		const { manifest, deploy } = fixtures[projectType];
		const manifestFilename = `manifest.${format}`;
		const deployFilename = `deploy.${format}`;
		const frameworkVersion = format === 'xml' ? '1.0' : '2.0';

		it('parses every identity field and its original property location', () => {
			const { document, originalDocument, normalized } = parseControlFile(format, 'manifest', manifest);
			expect(normalized).toEqual({
				...EXPECTED_MANIFESTS[projectType], frameworkVersion,
				source: { file: manifestFilename, propertyPath: '/manifest' },
				propertyPaths: {
					projectType: format === 'xml' ? '/manifest/@projecttype' : '/manifest/projecttype',
					projectName: '/manifest/projectname', publisherId: '/manifest/publisherid', projectId: '/manifest/projectid',
					projectVersion: '/manifest/projectversion', frameworkVersion: '/manifest/frameworkversion',
				},
			});
			expect(JSON.stringify(document)).toBe(originalDocument);
			if (format !== 'xml') {
				expect(document.manifest.dependencies).toEqual(EXPECTED_DEPENDENCIES[projectType]);
			}
		});

		it('preserves all paths, scripts, and repeated deploy groups in declaration order', () => {
			const { document, originalDocument, normalized } = parseControlFile(format, 'deploy', deploy);
			assertDeployValues(normalized, projectType);
			expect(JSON.stringify(document)).toBe(originalDocument);

			if (projectType === 'suiteapp') {
				expect(normalized[3].paths[0].source).toEqual({
					file: deployFilename,
					propertyPath: format === 'xml' ? '/deploy/files[2]/path[1]' : '/deploy/3/files/path/0',
				});
				const scriptPath = format === 'xml' ? '/deploy/run[1]/script[2]' : '/deploy/1/run/script/1';
				expect(normalized[1].scripts[1]).toMatchObject({
					source: { file: deployFilename, propertyPath: scriptPath },
					path: { source: { file: deployFilename, propertyPath: `${scriptPath}/path${format === 'xml' ? '[1]' : ''}` } },
					deploymentSource: { file: deployFilename, propertyPath: `${scriptPath}/deployment${format === 'xml' ? '[1]' : ''}` },
				});
			} else {
				expect(normalized[1].paths[0].source).toEqual({
					file: deployFilename,
					propertyPath: format === 'xml' ? '/deploy/configuration[2]/path[1]' : '/deploy/1/configuration/path/0',
				});
			}
			expect(normalized[4].source).toEqual({
				file: deployFilename,
				propertyPath: format === 'xml' ? '/deploy/translationimports[1]' : '/deploy/4/translationimports',
			});
		});

		it('reads the physical control-file pair through synchronous metadata and asynchronous inspection', async () => {
			const projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-control-file-examples-'));
			try {
				await Promise.all([
					writeFile(join(projectFolder, manifestFilename), manifest),
					writeFile(join(projectFolder, deployFilename), deploy),
				]);
				const description = await inspectControlFilesAndGetProjectDescription(projectFolder);
				expect(description.manifest).toEqual(getProjectManifestFile(projectFolder));
				expect(description.manifest).toMatchObject({ ...EXPECTED_MANIFESTS[projectType], frameworkVersion });
				expect(description.controlFiles).toMatchObject({
					sdfFrameworkVersion: frameworkVersion,
					manifest: { filename: manifestFilename, filepath: join(projectFolder, manifestFilename), format },
					deploy: { filename: deployFilename, filepath: join(projectFolder, deployFilename), format },
				});
				assertDeployValues(description.deployGroups, projectType);
			} finally {
				await rm(projectFolder, { recursive: true, force: true });
			}
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
		['deploy', { deploy: [{ run: { script: ['invalid'] } }] }, '/deploy/0/run/script/0'],
	])('reports an unreadable %s control file with its property location (case %#)', (kind, document, propertyPath) => {
		// JSON is also valid YAML; these cases exercise the shared structure contract through both parsers.
		expect(() => parseControlFile(format, kind, JSON.stringify(document)))
			.toThrow(`Invalid ${kind}.${format} at ${propertyPath}:`);
	});

	it('preserves singleton selections, empty paths, and escaped JSON Pointer locations', () => {
		const { normalized } = parseControlFile(format, 'deploy', JSON.stringify({ deploy: [
			{ objects: { path: '~/Objects/*' } },
			{ run: { script: { path: '~/Objects/install.xml', deployment: 'customdeploy_install' } } },
			{ files: { path: [] } },
			{ 'custom/group~name': {} },
		] }));
		expect(normalized[0].paths[0]).toEqual({
			value: '~/Objects/*', source: { file: `deploy.${format}`, propertyPath: '/deploy/0/objects/path' },
		});
		expect(normalized[1].scripts[0].source.propertyPath).toBe('/deploy/1/run/script');
		expect(normalized[2].paths).toEqual([]);
		expect(normalized[3].source.propertyPath).toBe('/deploy/3/custom~1group~0name');
	});

	it('accepts an empty deploy array while content validation is deferred', () => {
		expect(parseControlFile(format, 'deploy', '{"deploy": []}').normalized).toEqual([]);
	});

	it.each(['1.0', '2.0', '2.0.0', undefined])('leaves framework-version validation deferred: %s', (frameworkversion) => {
		const { normalized } = parseControlFile(format, 'manifest', JSON.stringify({
			manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion },
		}));
		expect(normalized.frameworkVersion).toBe(frameworkversion ?? '');
	});
}

module.exports = { parseControlFile, defineProjectParsingTests, defineStructuredControlFileTests };
