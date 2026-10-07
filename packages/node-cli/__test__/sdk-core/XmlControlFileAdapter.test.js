/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { getControlFileAdapter } = require('../../../sdk-core/build/services/project/ControlFileAdapterRegistry');

describe('XML control-file adapter', () => {
	it('retains original manifest declarations when normalizing metadata', () => {
		const adapter = getControlFileAdapter({ kind: 'manifest', filename: 'manifest.xml', format: 'xml' });
		const document = adapter.parseDocument(
			'<manifest projecttype="SUITEAPP"><publisherid>com.example</publisherid><projectid>app</projectid>' +
			'<features><feature required="true">FIRST</feature><feature required="false">SECOND</feature></features></manifest>',
			'manifest.xml'
		);
		const originalDocument = JSON.stringify(document);
		const manifest = adapter.normalizeManifest(document, 'manifest.xml');

		expect(manifest).toMatchObject({ projectType: 'SUITEAPP', applicationId: 'com.example.app' });
		expect(document.manifest.features.feature).toHaveLength(2);
		expect(JSON.stringify(document)).toBe(originalDocument);
	});

	it('preserves repeated deploy groups and installation-script source locations', () => {
		const adapter = getControlFileAdapter({ kind: 'deploy', filename: 'deploy.xml', format: 'xml' });
		const document = adapter.parseDocument(
			'<deploy><files><path>~/FileCabinet/first.js</path></files>' +
			'<run><script><path>~/Objects/install.xml</path><deployment>customdeploy_install</deployment></script></run>' +
			'<files><path>~/FileCabinet/second.js</path></files></deploy>',
			'deploy.xml'
		);
		const groups = adapter.normalizeDeploy(document, 'deploy.xml');

		expect(groups.map((group) => group.kind)).toEqual(['files', 'run', 'files']);
		expect(groups[2].paths[0]).toEqual({
			value: '~/FileCabinet/second.js',
			source: { file: 'deploy.xml', propertyPath: '/deploy/files[2]/path[1]' },
		});
		expect(groups[1].scripts[0]).toEqual({
			path: {
				value: '~/Objects/install.xml',
				source: { file: 'deploy.xml', propertyPath: '/deploy/run[1]/script[1]/path[1]' },
			},
			deployment: 'customdeploy_install',
			deploymentSource: { file: 'deploy.xml', propertyPath: '/deploy/run[1]/script[1]/deployment[1]' },
			source: { file: 'deploy.xml', propertyPath: '/deploy/run[1]/script[1]' },
		});
	});

	it.each([
		['manifest', 'normalizeManifest'],
		['deploy', 'normalizeDeploy'],
	])('rejects a wrong %s root during normalization', (kind, normalizeMethod) => {
		const filename = `${kind}.xml`;
		const adapter = getControlFileAdapter({ kind, filename, format: 'xml' });
		const document = adapter.parseDocument('<other/>', filename);
		expect(() => adapter[normalizeMethod](document, filename))
			.toThrow(`Invalid ${filename}: expected <${kind}> as the root element.`);
	});
});
