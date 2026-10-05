/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { metadata } = require('@oracle/suitecloud-sdk-core');
const suiteScriptModules = require('../../src/metadata/SuiteScriptModulesMetadata');
const suiteScriptTypes = require('../../src/metadata/SuiteScriptTypesMetadata');

describe('SuiteScript metadata compatibility modules', () => {
	it('exposes SDK Core modules in the Node CLI format', () => {
		expect(suiteScriptModules).toEqual(
			metadata.SUITESCRIPT_MODULES.map((id) => ({ id }))
		);
	});

	it('exposes SDK Core templates in the Node CLI type format', () => {
		expect(suiteScriptTypes).toEqual(
			metadata.SUITESCRIPT_TEMPLATES.map(({ id, name }) => ({ id, name }))
		);
	});
});
