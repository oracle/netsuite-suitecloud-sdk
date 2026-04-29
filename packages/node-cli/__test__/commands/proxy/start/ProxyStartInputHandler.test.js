'use strict';

const mockPrompt = jest.fn();

jest.mock('inquirer', () => ({
	default: {
		prompt: mockPrompt,
		Separator: class Separator {
			constructor(value) {
				this.value = value;
			}
		},
	},
}));

jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	getAuthIds: jest.fn(),
}));

jest.mock('../../../../src/utils/ClientAPIKeyUtils', () => ({
	resolveDefaultClientApiKey: jest.fn(),
}));

const ProxyStartInputHandler = require('../../../../src/commands/proxy/start/ProxyStartInputHandler');
const { getAuthIds } = require('../../../../src/utils/AuthenticationUtils');
const { resolveDefaultClientApiKey } = require('../../../../src/utils/ClientAPIKeyUtils');

describe('ProxyStartInputHandler getParameters()', () => {
	let inputHandler;

	beforeEach(() => {
		jest.clearAllMocks();
		inputHandler = new ProxyStartInputHandler({
			sdkPath: '/tmp/fake-sdk-path',
			executionEnvironmentContext: { env: 'test' },
		});

		resolveDefaultClientApiKey.mockResolvedValue({ apiKey: 'fake-api-key' });
		getAuthIds.mockResolvedValue({
			isSuccess: () => true,
			data: {
				defaultAuth: {
					accountInfo: {
						companyName: 'Test Company',
						roleName: 'Administrator',
					},
				},
			},
		});
		mockPrompt.mockResolvedValue({ authid: 'defaultAuth', port: 8181 });
	});

	it('should propose port 8181 by default when no port parameter is provided', async () => {
		await inputHandler.getParameters({});

		const questions = mockPrompt.mock.calls[0][0];
		expect(questions[1].default).toBe(8181);
	});

	it('should preserve the provided port as the interactive default', async () => {
		await inputHandler.getParameters({ port: 8383 });

		const questions = mockPrompt.mock.calls[0][0];
		expect(questions[1].default).toBe(8383);
	});

	it('should throw when there are no configured auth IDs', async () => {
		getAuthIds.mockResolvedValue({
			isSuccess: () => true,
			data: {},
		});

		await expect(inputHandler.getParameters({})).rejects.toBeTruthy();
		expect(mockPrompt).not.toHaveBeenCalled();
	});
});
