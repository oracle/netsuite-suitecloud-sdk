/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as net from 'node:net';
import * as vscode from 'vscode';
import { DEVELOPER_ASSISTANT, VSCODE_PLATFORM } from '../../../ApplicationConstants';
import type {
	ExecutionEnvironmentContextInstance,
	SuiteCloudAuthProxyEventPayload,
	SuiteCloudAuthProxyServiceInstance,
} from '../../../types/JavascriptNodeCli';
import {
	ExecutionEnvironmentContext,
	SuiteCloudAuthProxyEvents,
	SuiteCloudAuthProxyService,
} from '../../../util/ExtensionUtil';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';

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
	startupTimeoutMs: number;
};

type ProxyReadiness = {
	promise: Promise<void>;
	resolve: () => void;
	reject: (error: Error) => void;
	startTimeout: () => void;
	dispose: () => void;
};

type ActiveProxyStart = {
	proxy: SuiteCloudAuthProxyServiceInstance;
	readiness: ProxyReadiness;
	proxyStartPromise: Promise<void>;
	isCancelled: boolean;
};

class ProxyStartCancelledError extends Error {
	constructor() {
		super(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyStartCancelled);
	}
}

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
		DEVELOPER_ASSISTANT.ALLOWED_PROXY_PATH_PREFIX,
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
		server.listen(port, DEVELOPER_ASSISTANT.PROXY_URL.LOCALHOST_IP);
	});

const DEFAULT_DEPENDENCIES: ProxyServiceDependencies = {
	createExecutionEnvironmentContext,
	createProxy,
	isPortInUse,
	startupTimeoutMs: STARTUP_TIMEOUT_MS,
};

export default class ProxyService {
	private readonly _callbacks: ProxyServiceCallbacks;
	private readonly _dependencies: ProxyServiceDependencies;
	private _proxy?: SuiteCloudAuthProxyServiceInstance;
	private _isRunning = false;
	private _isStarting = false;
	private _isStopping = false;
	private _authorizationRefresh?: Promise<void>;
	private _activeStart?: ActiveProxyStart;

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
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyAlreadyRunning);
		}
		if (await this._dependencies.isPortInUse(input.port)) {
			throw new Error(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyPortInUse(input.port)
			);
		}

		this._isStarting = true;
		let proxy: SuiteCloudAuthProxyServiceInstance | undefined;
		let readiness: ProxyReadiness | undefined;
		let activeStart: ActiveProxyStart | undefined;
		try {
			proxy = this._dependencies.createProxy(
				input,
				this._dependencies.createExecutionEnvironmentContext()
			);
			this._proxy = proxy;
			readiness = this._createReadiness(this._dependencies.startupTimeoutMs);
			this._registerProxyEvents(proxy, readiness);
			const proxyStartPromise = proxy.start(input.authId, input.port);
			activeStart = {
				proxy,
				readiness,
				proxyStartPromise,
				isCancelled: false,
			};
			this._activeStart = activeStart;
			await Promise.all([
				proxyStartPromise.then(readiness.startTimeout),
				readiness.promise,
			]);
			if (activeStart.isCancelled || this._proxy !== proxy) {
				throw new ProxyStartCancelledError();
			}
			this._isRunning = true;
			this._callbacks.onLog(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.messages.proxyListening(input.port)
			);
		} catch (error) {
			const startError = activeStart?.isCancelled
				? new ProxyStartCancelledError()
				: error;
			if (proxy && !activeStart?.isCancelled) {
				await this._stopAfterFailedStart(proxy);
			}
			throw this._createStartError(startError);
		} finally {
			readiness?.dispose();
			if (this._activeStart?.proxy === proxy) {
				this._activeStart = undefined;
			}
			this._isStarting = false;
		}
	}

	async stop(): Promise<void> {
		const proxy = this._proxy;
		if (!proxy) {
			return;
		}
		const activeStart = this._activeStart?.proxy === proxy ? this._activeStart : undefined;
		if (activeStart) {
			activeStart.isCancelled = true;
			activeStart.readiness.reject(new ProxyStartCancelledError());
			try {
				await activeStart.proxyStartPromise;
			} catch {
				// stop() still owns releasing the proxy after a cancelled startup failure.
			}
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
				const error = this._eventError(
					payload,
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyEventStartFailed
				);
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
		this._callbacks.onLog(
			this._eventError(
				payload,
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyEventError
			).message,
			true
		);
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
			this._eventError(
				payload,
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyAuthorizationRefreshRequired
			).message,
			true
		);
		this._authorizationRefresh = (async () => {
			await this._callbacks.refreshAuthorization(payload.authId);
			if (this._proxy !== proxy) {
				return;
			}
			await proxy.reloadAccessToken();
			this._callbacks.onLog(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.messages.proxyAuthorizationRefreshed(
					payload.authId
				)
			);
		})()
			.catch((error) => {
				this._callbacks.onLog(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyAuthorizationRefreshFailed(
						this._errorMessage(error)
					),
					true
				);
			})
			.finally(() => {
				this._authorizationRefresh = undefined;
			});

		await this._authorizationRefresh;
	}

	private _createReadiness(startupTimeoutMs: number): ProxyReadiness {
		let resolvePromise!: () => void;
		let rejectPromise!: (error: Error) => void;
		let settled = false;
		let timeout: NodeJS.Timeout | undefined;

		const promise = new Promise<void>((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});

		return {
			promise,
			resolve: () => {
				if (!settled) {
					settled = true;
					if (timeout) {
						clearTimeout(timeout);
					}
					resolvePromise();
				}
			},
			reject: (error) => {
				if (!settled) {
					settled = true;
					if (timeout) {
						clearTimeout(timeout);
					}
					rejectPromise(error);
				}
			},
			startTimeout: () => {
				if (settled || timeout) {
					return;
				}
				timeout = setTimeout(() => {
					if (!settled) {
						settled = true;
						rejectPromise(
							new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyStartTimeout)
						);
					}
				}, startupTimeoutMs);
			},
			dispose: () => {
				if (timeout) {
					clearTimeout(timeout);
				}
			},
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
		return new Error(
			SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyStartFailed(
				this._errorMessage(error)
			)
		);
	}

	private _errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
}
