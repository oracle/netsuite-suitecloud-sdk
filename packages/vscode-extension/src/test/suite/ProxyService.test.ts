/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import { EventEmitter } from 'events';
import ProxyService, {
	ProxyServiceDependencies,
	StartProxyInput,
} from '../../service/controlPanel/devAssist/proxy/ProxyService';
import type {
	ExecutionEnvironmentContextInstance,
	SuiteCloudAuthProxyServiceInstance,
} from '../../types/JavascriptNodeCli';
import { SuiteCloudAuthProxyEvents } from '../../util/ExtensionUtil';

class FakeProxy extends EventEmitter implements SuiteCloudAuthProxyServiceInstance {
	startCalls: Array<{ authId: string; port: number }> = [];
	stopCount = 0;
	reloadCount = 0;
	emitListeningOnStart = true;

	async start(authId: string, port: number): Promise<void> {
		this.startCalls.push({ authId, port });
		if (this.emitListeningOnStart) {
			this.emit(SuiteCloudAuthProxyEvents.SERVER_INFO.LISTENING, {
				localURL: `http://127.0.0.1:${port}`,
			});
		}
	}

	async stop(): Promise<void> {
		this.stopCount += 1;
		this.emit(SuiteCloudAuthProxyEvents.SERVER_INFO.STOPPED);
	}

	async reloadAccessToken(): Promise<void> {
		this.reloadCount += 1;
	}

	updateApiKey(): void {}
}

const INPUT: StartProxyInput = {
	authId: 'account',
	port: 8181,
	sdkPath: '/sdk/cli.jar',
	apiKey: 'secret',
};

const createService = (proxy: FakeProxy, overrides: Partial<ProxyServiceDependencies> = {}) => {
	const createdInputs: StartProxyInput[] = [];
	const logs: Array<{ message: string; isError?: boolean }> = [];
	let unexpectedStopCount = 0;
	let refreshedAuthId: string | undefined;
	const service = new ProxyService(
		{
			onLog: (message, isError) => logs.push({ message, isError }),
			onUnexpectedStop: () => {
				unexpectedStopCount += 1;
			},
			refreshAuthorization: async (authId) => {
				refreshedAuthId = authId;
			},
		},
		{
			createExecutionEnvironmentContext: () => ({}) as ExecutionEnvironmentContextInstance,
			createProxy: (input) => {
				createdInputs.push(input);
				return proxy;
			},
			isPortInUse: async () => false,
			...overrides,
		}
	);
	return {
		service,
		createdInputs,
		logs,
		getUnexpectedStopCount: () => unexpectedStopCount,
		getRefreshedAuthId: () => refreshedAuthId,
	};
};

const waitForAsyncEventHandler = (): Promise<void> =>
	new Promise((resolve) => setImmediate(resolve));

suite('Control Panel Proxy Service', () => {
	test('starts the existing proxy implementation with the VS Code SDK and API key', async () => {
		const proxy = new FakeProxy();
		const { service, createdInputs, logs } = createService(proxy);

		await service.start(INPUT);

		assert.strictEqual(service.isRunning, true);
		assert.deepStrictEqual(createdInputs, [INPUT]);
		assert.deepStrictEqual(proxy.startCalls, [{ authId: 'account', port: 8181 }]);
		assert.deepStrictEqual(logs, [{
			message: 'SuiteCloud proxy is listening on port 8181.',
			isError: undefined,
		}]);
	});

	test('rejects an occupied port before creating the proxy', async () => {
		const proxy = new FakeProxy();
		const { service, createdInputs } = createService(proxy, {
			isPortInUse: async () => true,
		});

		await assert.rejects(service.start(INPUT), /Port 8181 is already in use/);
		assert.deepStrictEqual(createdInputs, []);
		assert.strictEqual(service.isRunning, false);
	});

	test('recovers cleanly when proxy construction fails', async () => {
		const proxy = new FakeProxy();
		const { service } = createService(proxy, {
			createProxy: () => {
				throw new Error('Proxy implementation unavailable.');
			},
		});

		await assert.rejects(service.start(INPUT), /Proxy implementation unavailable/);
		await assert.rejects(service.start(INPUT), /Proxy implementation unavailable/);
		assert.strictEqual(service.isRunning, false);
	});

	test('surfaces startup events as failures and releases the proxy', async () => {
		const proxy = new FakeProxy();
		proxy.emitListeningOnStart = false;
		proxy.start = async () => {
			proxy.emit(SuiteCloudAuthProxyEvents.PROXY_ERROR.DEFAULT, {
				authId: 'account',
				message: 'Cannot bind proxy port.',
			});
		};
		const { service, getUnexpectedStopCount } = createService(proxy);

		await assert.rejects(service.start(INPUT), /Unable to start SuiteCloud proxy: Cannot bind proxy port/);
		assert.strictEqual(service.isRunning, false);
		assert.strictEqual(proxy.stopCount, 1);
		assert.strictEqual(getUnexpectedStopCount(), 0);
	});

	test('stops only the owned in-process proxy', async () => {
		const proxy = new FakeProxy();
		const { service, getUnexpectedStopCount } = createService(proxy);
		await service.start(INPUT);

		await service.stop();

		assert.strictEqual(proxy.stopCount, 1);
		assert.strictEqual(service.isRunning, false);
		assert.strictEqual(getUnexpectedStopCount(), 0);
	});

	test('reports an unexpected proxy stop to the controller', async () => {
		const proxy = new FakeProxy();
		const { service, getUnexpectedStopCount } = createService(proxy);
		await service.start(INPUT);

		proxy.emit(SuiteCloudAuthProxyEvents.SERVER_INFO.STOPPED);

		assert.strictEqual(service.isRunning, false);
		assert.strictEqual(getUnexpectedStopCount(), 1);
	});

	test('forwards runtime proxy errors without changing running state', async () => {
		const proxy = new FakeProxy();
		const { service, logs } = createService(proxy);
		await service.start(INPUT);

		proxy.emit(SuiteCloudAuthProxyEvents.SERVER_ERROR.DEFAULT, {
			authId: 'account',
			message: 'Backend connection failed.',
		});

		assert.strictEqual(service.isRunning, true);
		assert.ok(logs.some(({ message, isError }) =>
			message === 'Backend connection failed.' && isError
		));
	});

	test('refreshes authorization and reloads the proxy access token', async () => {
		const proxy = new FakeProxy();
		const { service, getRefreshedAuthId, logs } = createService(proxy);
		await service.start(INPUT);

		proxy.emit(SuiteCloudAuthProxyEvents.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED, {
			authId: 'account',
			message: 'Authorization expired.',
		});
		await waitForAsyncEventHandler();

		assert.strictEqual(getRefreshedAuthId(), 'account');
		assert.strictEqual(proxy.reloadCount, 1);
		assert.ok(logs.some(({ message, isError }) => message === 'Authorization expired.' && isError));
		assert.ok(logs.some(({ message }) => message.includes('Authorization refreshed')));
	});
});
