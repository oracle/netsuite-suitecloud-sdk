/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	ensureCreateProjectLocation,
	buildCreateProjectSdkParams,
	toIncludeUnitTestingBoolean,
} = require('@oracle/suitecloud-sdk-core/commands/project/create/CreateProjectHandler');
const { preparePackageParams } = require('@oracle/suitecloud-sdk-core/commands/project/package/PackageHandler');

const PROJECT_SUITEAPP = 'SUITEAPP';
const PROJECT_ACP = 'ACCOUNTCUSTOMIZATIONPROJECT';

describe('CreatePackageHandlers', () => {
	it('ensureCreateProjectLocation should set folder name and parent directory', () => {
		const result = ensureCreateProjectLocation(
			{
				type: PROJECT_SUITEAPP,
				publisherid: 'com.test',
				projectid: 'demo',
			},
			'/tmp/workspace',
			PROJECT_SUITEAPP,
			PROJECT_ACP
		);

		expect(result.projectfoldername).toBe('com.test.demo');
		expect(result.parentdirectory).toBe('/tmp/workspace/com.test.demo');
	});

	it('buildCreateProjectSdkParams should normalize suiteapp payload', () => {
		const result = buildCreateProjectSdkParams(
			{
				parentdirectory: '/tmp/workspace/com.test.demo',
				type: PROJECT_SUITEAPP,
				publisherid: 'com.test',
				projectid: 'demo',
				projectversion: '1.2.3',
				overwrite: true,
			},
			'src',
			PROJECT_SUITEAPP
		);

		expect(result).toEqual({
			parentdirectory: '"/tmp/workspace/com.test.demo"',
			type: PROJECT_SUITEAPP,
			projectname: 'src',
			overwrite: '',
			publisherid: 'com.test',
			projectid: 'demo',
			projectversion: '1.2.3',
		});
	});

	it('toIncludeUnitTestingBoolean should normalize booleans', () => {
		expect(toIncludeUnitTestingBoolean('true')).toBe(true);
		expect(toIncludeUnitTestingBoolean('false')).toBe(false);
		expect(toIncludeUnitTestingBoolean(true)).toBe(true);
		expect(toIncludeUnitTestingBoolean(false)).toBe(false);
	});

	it('preparePackageParams should set default quoted paths', () => {
		const result = preparePackageParams({}, '/tmp/workspace', '/tmp/workspace/projectA');
		expect(result).toEqual({
			destination: '"/tmp/workspace/build"',
			project: '"/tmp/workspace/projectA"',
		});
	});
});
