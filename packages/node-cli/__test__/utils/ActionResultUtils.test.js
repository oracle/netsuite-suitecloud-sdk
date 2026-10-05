/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const ActionResultUtils = require('../../src/utils/ActionResultUtils');

describe('ActionResultUtils', () => {
	it('preserves scalar values and separates multi-value options with spaces', () => {
		const commandMetadata = {
			options: {
				scriptid: { disableInIntegrationMode: false },
				type: { disableInIntegrationMode: false },
			},
		};
		const actionResult = {
			commandParameters: {
				scriptid: 'customrecord',
				type: ['addressForm', 'advancedpdftemplate'],
			},
		};

		expect(
			ActionResultUtils.extractNotInteractiveCommand('object:list', commandMetadata, actionResult)
		).toBe(
			'object:list --scriptid customrecord --type addressForm advancedpdftemplate'
		);
	});
});
