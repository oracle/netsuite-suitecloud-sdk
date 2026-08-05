/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdir, mkdtemp, rm, symlink, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const {
	buildCustomObjectsXml,
} = require('../../../sdk-core/build/commands/object/ObjectCommandXml');
const {
	copyDirectoryContents,
} = require('../../../sdk-core/build/commands/object/ObjectFiles');
const {
	PathOutsideRootError,
} = require('../../../sdk-core/build/services/project/ProjectPathResolver');

describe('ObjectCommandXml', () => {
	it('generates the same custom-object request XML as Java', () => {
		expect(buildCustomObjectsXml([
			{ type: 'customsegment', scriptId: 'scriptId1', appId: 'appId' },
			{ type: 'type', scriptId: 'scriptId2', appId: 'appId' },
		])).toBe([
			'<customObjects>',
			'  <customObject package="appId" id="scriptId1" type="customsegment"/>',
			'  <customObject package="appId" id="customrecord_scriptId1" type="customrecordtype"/>',
			'  <customObject package="appId" id="scriptId2" type="type"/>',
			'</customObjects>',
		].join('\n'));
	});
});

describe('ObjectFiles', () => {
	let temporaryRoot;

	beforeEach(async () => {
		temporaryRoot = await mkdtemp(join(tmpdir(), 'suitecloud-object-service-'));
	});

	afterEach(async () => {
		await rm(temporaryRoot, { recursive: true, force: true });
	});

	it('rejects archive entries that resolve outside the extraction folder', async () => {
		const sourceFolder = join(temporaryRoot, 'source');
		const destinationFolder = join(temporaryRoot, 'destination');
		const outsideFile = join(temporaryRoot, 'outside.xml');
		await mkdir(sourceFolder);
		await mkdir(destinationFolder);
		await writeFile(outsideFile, '<customrecordtype/>', 'utf8');
		await symlink(outsideFile, join(sourceFolder, 'escaped.xml'));

		await expect(copyDirectoryContents(sourceFolder, destinationFolder)).rejects.toThrow(PathOutsideRootError);
	});
});
