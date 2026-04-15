'use strict';

jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	refreshAuthorization: jest.fn(),
}));

const ProxyStartAction = require('../../../../src/commands/proxy/start/ProxyStartAction');
const { refreshAuthorization } = require('../../../../src/utils/AuthenticationUtils');

describe('ProxyStartAction _handleManualAuthRefreshRequired()', () => {
	const log = {
		error: jest.fn(),
		info: jest.fn(),
	};

	const executionEnvironmentContext = { env: 'test' };
	const sdkPath = '/tmp/fake-sdk-path';

	let action;

	beforeEach(() => {
		jest.clearAllMocks();
		action = new ProxyStartAction({
			log,
			sdkPath,
			executionEnvironmentContext,
		});
		action._proxyService = {
			reloadAccessToken: jest.fn().mockResolvedValue(),
		};
	});

	it('should trigger refresh authorization and reload proxy access token when successful', async () => {
		refreshAuthorization.mockResolvedValue({
			isSuccess: () => true,
		});

		await action._handleManualAuthRefreshRequired({
			message: 'manual refresh required',
			authId: 'defaultAuth',
		});

		expect(log.error).toHaveBeenCalledWith('manual refresh required');
		expect(refreshAuthorization).toHaveBeenCalledWith('defaultAuth', sdkPath, executionEnvironmentContext);
		expect(action._proxyService.reloadAccessToken).toHaveBeenCalledTimes(1);
		expect(log.info).toHaveBeenCalledTimes(2);
	});

	it('should log refresh operation errors and skip reloading token when refresh fails', async () => {
		refreshAuthorization.mockResolvedValue({
			isSuccess: () => false,
			errorMessages: ['refresh failed'],
		});

		await action._handleManualAuthRefreshRequired({
			message: 'manual refresh required',
			authId: 'defaultAuth',
		});

		expect(refreshAuthorization).toHaveBeenCalledWith('defaultAuth', sdkPath, executionEnvironmentContext);
		expect(log.error).toHaveBeenCalledWith(['refresh failed']);
		expect(action._proxyService.reloadAccessToken).not.toHaveBeenCalled();
	});

	it('should not start a second refreshAuthorization while one is in progress', async () => {
		let resolveRefresh;
		refreshAuthorization.mockImplementation(
			() => new Promise((resolve) => {
				resolveRefresh = resolve;
			})
		);

		const firstCall = action._handleManualAuthRefreshRequired({
			message: 'manual refresh required',
			authId: 'defaultAuth',
		});

		const secondCall = action._handleManualAuthRefreshRequired({
			message: 'manual refresh required',
			authId: 'defaultAuth',
		});

		await Promise.resolve();

		expect(refreshAuthorization).toHaveBeenCalledTimes(1);

		resolveRefresh({
			isSuccess: () => true,
		});

		await Promise.all([firstCall, secondCall]);

		expect(refreshAuthorization).toHaveBeenCalledTimes(1);
		expect(action._proxyService.reloadAccessToken).toHaveBeenCalledTimes(1);
	});
});

describe('ProxyStartAction _registerShutdownHandlers()', () => {
	const log = {
		error: jest.fn(),
		info: jest.fn(),
	};

	let action;
	let processOnSpy;
	let processExitSpy;
	let processStdoutWriteSpy;
	let signalHandlers;

	beforeEach(() => {
		jest.clearAllMocks();
		signalHandlers = {};

		action = new ProxyStartAction({
			log,
			sdkPath: '/tmp/fake-sdk-path',
			executionEnvironmentContext: { env: 'test' },
		});
		action._proxyService = {
			stop: jest.fn().mockResolvedValue(),
		};

		processOnSpy = jest.spyOn(process, 'on').mockImplementation((signal, handler) => {
			signalHandlers[signal] = handler;
			return process;
		});
		processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
		processStdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	});

	afterEach(() => {
		processOnSpy.mockRestore();
		processExitSpy.mockRestore();
		processStdoutWriteSpy.mockRestore();
	});

	it('should log stopping message before stopping proxy during shutdown', async () => {
		action._registerShutdownHandlers();

		await signalHandlers.SIGINT();

		expect(processStdoutWriteSpy).toHaveBeenCalledWith('\n');
		expect(log.info).toHaveBeenCalledWith('Stopping proxy. Waiting for active requests to finish...');
		expect(action._proxyService.stop).toHaveBeenCalledTimes(1);
		expect(processExitSpy).toHaveBeenCalledWith(0);
	});

	it('should execute shutdown only once when multiple signals are received', async () => {
		action._registerShutdownHandlers();

		await signalHandlers.SIGINT();
		await signalHandlers.SIGTERM();

		expect(processStdoutWriteSpy).toHaveBeenCalledTimes(1);
		expect(log.info).toHaveBeenCalledTimes(1);
		expect(action._proxyService.stop).toHaveBeenCalledTimes(1);
		expect(processExitSpy).toHaveBeenCalledTimes(1);
	});
});
