const AuthenticationUtils = require('../../src/utils/AuthenticationUtils');
const SdkExecutor = require('../../src/SdkExecutor');
const SdkExecutionContext = require('../../src/SdkExecutionContext');
const ExecutionEnvironmentContext = require('../../src/ExecutionEnvironmentContext');
const SdkOperationResult = require('../../src/utils/SdkOperationResult');
const { executeWithSpinner } = require('../../src/ui/CliSpinner');
const NodeTranslationService = require('../../src/services/NodeTranslationService');
const { UTILS } = require('../../src/services/TranslationKeys');

jest.mock('../../src/SdkExecutor', () => {
	return jest.fn().mockImplementation(() => ({
		execute: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
	}));
});

jest.mock('../../src/SdkExecutionContext', () => ({
	Builder: {
		forCommand: jest.fn().mockReturnThis(),
		addParam: jest.fn().mockReturnThis(),
		integration: jest.fn().mockReturnThis(),
		build: jest.fn().mockImplementation(() => ({ command: 'test-command', params: { authId: 'test-auth-id' } })),
	},
}));

jest.mock('../../src/ui/CliSpinner', () => ({
	executeWithSpinner: jest.fn().mockImplementation(({ action }) => action),
}));

jest.mock('../../src/services/NodeTranslationService');

describe('forceRefreshAuthorization', () => {
	const authId = 'test-auth-id';
	const sdkPath = '/path/to/sdk';
	const executionEnvironmentContext = new ExecutionEnvironmentContext();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should create SdkExecutor with correct parameters', async () => {
		await AuthenticationUtils.forceRefreshAuthorization(authId, sdkPath, executionEnvironmentContext);
		expect(SdkExecutor).toHaveBeenCalledTimes(1);
		expect(SdkExecutor).toHaveBeenCalledWith(sdkPath, executionEnvironmentContext);
	});

	it('should create SdkExecutionContext with correct command and parameters', async () => {
		await AuthenticationUtils.forceRefreshAuthorization(authId, sdkPath, executionEnvironmentContext);
		expect(SdkExecutionContext.Builder.forCommand).toHaveBeenCalledTimes(1);
		expect(SdkExecutionContext.Builder.forCommand).toHaveBeenCalledWith(AuthenticationUtils.COMMANDS.FORCE_REFRESH_AUTHORIZATION.SDK_COMMAND);
		expect(SdkExecutionContext.Builder.addParam).toHaveBeenCalledTimes(1);
		expect(SdkExecutionContext.Builder.addParam).toHaveBeenCalledWith(AuthenticationUtils.COMMANDS.FORCE_REFRESH_AUTHORIZATION.PARAMS.AUTH_ID, authId);
	});

	it('should execute SdkExecutor with correct context', async () => {
		const executeMock = jest.fn().mockResolvedValue({ status: 'SUCCESS' });
		SdkExecutor.mockImplementationOnce(() => ({ execute: executeMock }));
		await AuthenticationUtils.forceRefreshAuthorization(authId, sdkPath, executionEnvironmentContext);
		expect(executeMock).toHaveBeenCalledTimes(1);
		const context = SdkExecutionContext.Builder.build();
		expect(executeMock).toHaveBeenCalledWith(context);
	});

	it('should call executeWithSpinner with correct action and message', async () => {
		const executeMock = jest.fn().mockResolvedValue({ status: 'SUCCESS' });
		SdkExecutor.mockImplementationOnce(() => ({ execute: executeMock }));
		await AuthenticationUtils.forceRefreshAuthorization(authId, sdkPath, executionEnvironmentContext);
		const context = SdkExecutionContext.Builder.build();
		expect(executeWithSpinner).toHaveBeenCalledTimes(1);
		expect(executeWithSpinner).toHaveBeenCalledWith({
			action: executeMock(context),
			message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.AUTHORIZING),
		});
	});

	it('should return SdkOperationResult', async () => {
		const result = await AuthenticationUtils.forceRefreshAuthorization(authId, sdkPath, executionEnvironmentContext);
		expect(result).toBeInstanceOf(SdkOperationResult);
	});

	it('should handle error when executeWithSpinner fails', async () => {
		const error = new Error('Test error');
		executeWithSpinner.mockRejectedValue(error);
		await expect(AuthenticationUtils.forceRefreshAuthorization(authId, sdkPath, executionEnvironmentContext)).rejects.toThrow(error);
	});
});