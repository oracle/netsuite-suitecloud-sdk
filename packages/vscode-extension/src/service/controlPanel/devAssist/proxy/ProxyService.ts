/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as net from 'node:net';
import * as vscode from 'vscode';
import { DEVASSIST, VSCODE_PLATFORM } from '../../../../ApplicationConstants';
import type {
	ExecutionEnvironmentContextInstance,
	SuiteCloudAuthProxyEventPayload,
	SuiteCloudAuthProxyServiceInstance,
} from '../../../../types/JavascriptNodeCli';
import {
	ExecutionEnvironmentContext,
	SuiteCloudAuthProxyEvents,
	SuiteCloudAuthProxyService,
} from '../../../../util/ExtensionUtil';

export type StartProxyInput = {
	authId: string;
	port: number;
	sdkPath: string;
	apiKey: string;
};

export type ProxyServiceCallbacks = {
	onLog: (message: string, isError?: boolean) => void;
	onUnexpectedStop: () => void;
	refreshAuthorization: (authId: string) => Promise<void>;
};

export type ProxyServiceDependencies = {
	createExecutionEnvironmentContext: () => ExecutionEnvironmentContextInstance;
	createProxy: (
		input: StartProxyInput,
		executionEnvironmentContext: ExecutionEnvironmentContextInstance
	) => SuiteCloudAuthProxyServiceInstance;
	isPortInUse: (port: number) => Promise<boolean>;
};

type ProxyReadiness = {
	promise: Promise<void>;
	resolve: () => void;
	reject: (error: Error) => void;
	dispose: () => void;
};

const STARTUP_TIMEOUT_MS = 30000;

const createExecutionEnvironmentContext = (): ExecutionEnvironmentContextInstance =>
	new ExecutionEnvironmentContext({
		platform: VSCODE_PLATFORM,
		platformVersion: vscode.version,
	});

const createProxy = (
	input: StartProxyInput,
	executionEnvironmentContext: ExecutionEnvironmentContextInstance
): SuiteCloudAuthProxyServiceInstance =>
	new SuiteCloudAuthProxyService(
		input.sdkPath,
		executionEnvironmentContext,
		DEVASSIST.ALLOWED_PROXY_PATH_PREFIX,
		input.apiKey
	);

const isPortInUse = (port: number): Promise<boolean> =>
	new Promise((resolve) => {
		const server = net.createServer();
		let settled = false;

		const finish = (inUse: boolean) => {
			if (settled) {
				return;
			}
			settled = true;
			resolve(inUse);
		};

		server.once('error', (error: NodeJS.ErrnoException) => {
			finish(error.code === 'EADDRINUSE' || error.code === 'EACCES');
		});
		server.once('listening', () => {
			server.close(() => finish(false));
		});
		server.listen(port, '127.0.0.1');
	});

const DEFAULT_DEPENDENCIES: ProxyServiceDependencies = {
	createExecutionEnvironmentContext,
	createProxy,
	isPortInUse,
};

export default class ProxyService {
	private readonly _callbacks: ProxyServiceCallbacks;
	private readonly _dependencies: ProxyServiceDependencies;
	private _proxy?: SuiteCloudAuthProxyServiceInstance;
	private _isRunning = false;
	private _isStarting = false;
	private _isStopping = false;
	private _authorizationRefresh?: Promise<void>;

	constructor(
		callbacks: ProxyServiceCallbacks,
		dependencies: Partial<ProxyServiceDependencies> = {}
	) {
		this._callbacks = callbacks;
		this._dependencies = { ...DEFAULT_DEPENDENCIES, ...dependencies };
	}

	get isRunning(): boolean {
		return this._isRunning;
	}

	async start(input: StartProxyInput): Promise<void> {
		if (this._proxy || this._isStarting || this._isRunning) {
			throw new Error('SuiteCloud Developer Assistant proxy is already running.');
		}
		if (await this._dependencies.isPortInUse(input.port)) {
			throw new Error(
				`Port ${input.port} is already in use by another process. Choose a different local port and retry.`
			);
		}

		this._isStarting = true;
		let proxy: SuiteCloudAuthProxyServiceInstance | undefined;
		let readiness: ProxyReadiness | undefined;
		try {
			proxy = this._dependencies.createProxy(
				input,
				this._dependencies.createExecutionEnvironmentContext()
			);
			this._proxy = proxy;
			readiness = this._createReadiness();
			this._registerProxyEvents(proxy, readiness);
			await Promise.all([
				proxy.start(input.authId, input.port),
				readiness.promise,
			]);
			this._isRunning = true;
			this._callbacks.onLog(`SuiteCloud proxy is listening on port ${input.port}.`);
		} catch (error) {
			if (proxy) {
				await this._stopAfterFailedStart(proxy);
			}
			throw this._createStartError(error);
		} finally {
			readiness?.dispose();
			this._isStarting = false;
		}
	}

	async stop(): Promise<void> {
		const proxy = this._proxy;
		if (!proxy) {
			return;
		}

		this._isStopping = true;
		try {
			await proxy.stop();
		} finally {
			this._isRunning = false;
			this._isStopping = false;
			this._releaseProxy(proxy);
		}
	}

	async dispose(): Promise<void> {
		await this.stop();
	}

	private _registerProxyEvents(
		proxy: SuiteCloudAuthProxyServiceInstance,
		readiness: ProxyReadiness
	): void {
		proxy.on(SuiteCloudAuthProxyEvents.SERVER_INFO.LISTENING, readiness.resolve);
		proxy.on(
			SuiteCloudAuthProxyEvents.PROXY_ERROR.DEFAULT,
			(payload: SuiteCloudAuthProxyEventPayload) => {
				const error = this._eventError(payload, 'SuiteCloud proxy failed to start.');
				if (this._isStarting && !this._isRunning) {
					readiness.reject(error);
					return;
				}
				this._callbacks.onLog(error.message, true);
			}
		);
		proxy.on(
			SuiteCloudAuthProxyEvents.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED,
			(payload: SuiteCloudAuthProxyEventPayload) => {
				void this._handleAuthorizationRefresh(proxy, payload);
			}
		);
		proxy.on(SuiteCloudAuthProxyEvents.REQUEST_ERROR.PATH_NOT_ALLOWED, this._logProxyError);
		proxy.on(SuiteCloudAuthProxyEvents.REQUEST_ERROR.UNAUTHORIZED, this._logProxyError);
		proxy.on(SuiteCloudAuthProxyEvents.SERVER_ERROR.DEFAULT, this._logProxyError);
		proxy.on(SuiteCloudAuthProxyEvents.SERVER_ERROR.ON_AUTH_REFRESH, this._logProxyError);
		proxy.on(SuiteCloudAuthProxyEvents.SERVER_INFO.STOPPED, () => {
			if (this._isStopping) {
				return;
			}
			this._isRunning = false;
			this._releaseProxy(proxy);
			this._callbacks.onUnexpectedStop();
		});
	}

	private readonly _logProxyError = (payload: SuiteCloudAuthProxyEventPayload): void => {
		this._callbacks.onLog(this._eventError(payload, 'SuiteCloud proxy error.').message, true);
	};

	private async _handleAuthorizationRefresh(
		proxy: SuiteCloudAuthProxyServiceInstance,
		payload: SuiteCloudAuthProxyEventPayload
	): Promise<void> {
		if (this._authorizationRefresh) {
			await this._authorizationRefresh;
			return;
		}

		this._callbacks.onLog(
			this._eventError(payload, 'SuiteCloud authorization must be refreshed.').message,
			true
		);
		this._authorizationRefresh = (async () => {
			await this._callbacks.refreshAuthorization(payload.authId);
			if (this._proxy !== proxy) {
				return;
			}
			await proxy.reloadAccessToken();
			this._callbacks.onLog(`Authorization refreshed for auth ID "${payload.authId}".`);
		})()
			.catch((error) => {
				this._callbacks.onLog(
					`Unable to refresh authorization: ${this._errorMessage(error)}`,
					true
				);
			})
			.finally(() => {
				this._authorizationRefresh = undefined;
			});

		await this._authorizationRefresh;
	}

	private _createReadiness(): ProxyReadiness {
		let resolvePromise!: () => void;
		let rejectPromise!: (error: Error) => void;
		let settled = false;
		const timeout = setTimeout(() => {
			if (!settled) {
				settled = true;
				rejectPromise(
					new Error('Timed out while waiting for SuiteCloud Developer Assistant proxy to become ready.')
				);
			}
		}, STARTUP_TIMEOUT_MS);

		const promise = new Promise<void>((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});

		return {
			promise,
			resolve: () => {
				if (!settled) {
					settled = true;
					clearTimeout(timeout);
					resolvePromise();
				}
			},
			reject: (error) => {
				if (!settled) {
					settled = true;
					clearTimeout(timeout);
					rejectPromise(error);
				}
			},
			dispose: () => clearTimeout(timeout),
		};
	}

	private async _stopAfterFailedStart(proxy: SuiteCloudAuthProxyServiceInstance): Promise<void> {
		this._isStopping = true;
		try {
			await proxy.stop();
		} catch {
			// Preserve the original startup error.
		} finally {
			this._isStopping = false;
		}
		this._isRunning = false;
		this._releaseProxy(proxy);
	}

	private _releaseProxy(proxy: SuiteCloudAuthProxyServiceInstance): void {
		proxy.removeAllListeners();
		if (this._proxy === proxy) {
			this._proxy = undefined;
		}
	}

	private _eventError(
		payload: SuiteCloudAuthProxyEventPayload | undefined,
		fallback: string
	): Error {
		return new Error(payload?.message?.trim() || fallback);
	}

	private _createStartError(error: unknown): Error {
		return new Error(`Unable to start SuiteCloud proxy: ${this._errorMessage(error)}`);
	}

	private _errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
}
