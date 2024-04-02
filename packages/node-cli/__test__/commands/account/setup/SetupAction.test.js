jest.mock('../../../../src/commands/base/BaseAction');
jest.mock('../../../../src/SdkExecutor');
jest.mock('../../../../src/services/NodeTranslationService');

const SdkExecutor = require('../../../../src/SdkExecutor');
const NodeTranslationService = require('../../../../src/services/NodeTranslationService');

const sdkExecutorExecuteMock = jest.spyOn(SdkExecutor.prototype, 'execute');
const nodeTranslationServiceGetMessageMock = jest.spyOn(NodeTranslationService, 'getMessage');

const AuthenticateActionResult = require('../../../../src/services/actionresult/AuthenticateActionResult');
const SetupAction = require('../../../../src/commands/account/setup/SetupAction');

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	REUSE: 'REUSE',
};

describe('SetupAction execute(params)', () => {
	it('should fail when exception message is returned from java-core', async () => {
		// given
		const setupAction = new SetupAction({});
		const mockedJavaExecutionExceptionMessage = 'My mocked java exception';
		// needed to avoid missing spinner message
		nodeTranslationServiceGetMessageMock.mockReturnValue('My mocked spinner message');
		sdkExecutorExecuteMock.mockImplementation(() => {
			return Promise.reject(mockedJavaExecutionExceptionMessage);
		});

		// when
		const actionResult = await setupAction.execute({ mode: AUTH_MODE.OAUTH, });

		// then
		const expectedResult = AuthenticateActionResult.Builder.withErrors([mockedJavaExecutionExceptionMessage]).build();
		expect(actionResult.isSuccess()).toBe(false);
		expect(actionResult.errorMessages).toStrictEqual(expectedResult.errorMessages);
	});
});
