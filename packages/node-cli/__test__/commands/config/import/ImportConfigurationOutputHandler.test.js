'use strict';

const { ActionResult } = require('../../../../src/services/actionresult/ActionResult');
const ImportConfigurationOutputHandler = require('../../../../src/commands/config/import/ImportConfigurationOutputHandler');

describe('ImportConfigurationOutputHandler', () => {
	it('logs successful and failed imports like the Java command', () => {
		const log = { result: jest.fn(), error: jest.fn() };
		new ImportConfigurationOutputHandler({ log }).parse(ActionResult.Builder.withData({
			successfulImports: [{ type: 'features', id: 'all_features' }],
			failedImports: [{ type: 'feature', id: 'server_feature', message: 'Import failed.' }],
		}).build());
		expect(log.result.mock.calls).toEqual([
			['The following objects have been imported:'], ['features:all_features'],
		]);
		expect(log.error.mock.calls).toEqual([
			['The following objects have not been imported:'],
			['feature:server_feature failed: Import failed.'],
		]);
	});

	it('logs no imports for an empty status', () => {
		const log = { result: jest.fn(), error: jest.fn() };
		new ImportConfigurationOutputHandler({ log }).parse(
			ActionResult.Builder.withData({ successfulImports: [], failedImports: [] }).build()
		);
		expect(log.result).toHaveBeenCalledWith('No objects were imported.');
	});
});
