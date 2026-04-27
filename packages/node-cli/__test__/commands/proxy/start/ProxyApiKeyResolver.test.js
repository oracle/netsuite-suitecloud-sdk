'use strict';

jest.mock('../../../../src/services/NodeTranslationService', () => ({
	getMessage: jest.fn((message) => message),
}));

jest.mock('../../../../src/utils/ClientAPIKeyUtils', () => ({
	readClientAPIKeyFileContents: jest.fn(),
}));

jest.mock('../../../../src/utils/ClientAPIKeyObjectWrapper', () => ({
	ClientAPIKeyObjectWrapper: jest.fn(),
}));

const { resolveClientApiKey } = require('../../../../src/commands/proxy/start/ProxyApiKeyResolver');
const { readClientAPIKeyFileContents } = require('../../../../src/utils/ClientAPIKeyUtils');
const { ClientAPIKeyObjectWrapper } = require('../../../../src/utils/ClientAPIKeyObjectWrapper');

describe('ProxyApiKeyResolver', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should resolve api key using Client API key file helpers', async () => {
		readClientAPIKeyFileContents.mockResolvedValue({ data: 'raw-client-api-key-payload' });
		ClientAPIKeyObjectWrapper.mockImplementation(() => ({
			getDefaultKeyValue: () => 'resolved-api-key',
		}));

		const result = await resolveClientApiKey({
			sdkPath: '/tmp/fake-sdk-path',
			executionEnvironmentContext: { env: 'test' },
		});

		expect(readClientAPIKeyFileContents).toHaveBeenCalledTimes(1);
		expect(ClientAPIKeyObjectWrapper).toHaveBeenCalledWith('raw-client-api-key-payload');
		expect(result).toEqual({ apiKey: 'resolved-api-key' });
	});

	it('should throw actionable message when api key is missing', async () => {
		readClientAPIKeyFileContents.mockResolvedValue({ data: 'raw-client-api-key-payload' });
		ClientAPIKeyObjectWrapper.mockImplementation(() => ({
			getDefaultKeyValue: () => '',
		}));

		await expect(resolveClientApiKey({
			sdkPath: '/tmp/fake-sdk-path',
			executionEnvironmentContext: { env: 'test' },
		})).rejects.toEqual('COMMAND_PROXY_START_ERRORS_MISSING_API_KEY');
	});

	it('should propagate read failures', async () => {
		readClientAPIKeyFileContents.mockRejectedValue(['read failed']);

		await expect(resolveClientApiKey({
			sdkPath: '/tmp/fake-sdk-path',
			executionEnvironmentContext: { env: 'test' },
		})).rejects.toEqual(['read failed']);
	});
});