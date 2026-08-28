/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as net from 'net';
import { ChildProcess, spawn } from 'child_process';
import ProxyOutputProcessor from './ProxyOutputProcessor';

export type StartProxyInput = {
	authId: string;
	port: number;
	cwd: string;
	sdkPath: string;
};

export type ProxyProcessCallbacks = {
	onLog: (line: string, isError?: boolean) => void;
	onProcessClosed: (exitCode: number | null, signal: NodeJS.Signals | null) => void;
};

const STARTUP_TIMEOUT_MS = 30000;
const STOP_TIMEOUT_MS = 5000;

export default class ProxyProcessService {
	private _process?: ChildProcess;
	private readonly _callbacks: ProxyProcessCallbacks;
	private readonly _spawnProcess: typeof spawn;
	private readonly _outputProcessor: ProxyOutputProcessor;
	private readonly _startingProcesses = new WeakSet<ChildProcess>();
	private readonly _spawnFailedProcesses = new WeakSet<ChildProcess>();
	private _lastExitCode: number | null = null;
	private _lastExitSignal: NodeJS.Signals | null = null;

	constructor(callbacks: ProxyProcessCallbacks, spawnProcess: typeof spawn = spawn) {
		this._callbacks = callbacks;
		this._spawnProcess = spawnProcess;
		this._outputProcessor = new ProxyOutputProcessor((line, isError) =>
			callbacks.onLog(line, isError)
		);
	}

	get pid(): number | null {
		return this._process?.pid ?? null;
	}

	get isRunning(): boolean {
		return !!this._process && !this._process.killed;
	}

	async start(input: StartProxyInput): Promise<number> {
		if (this.isRunning) {
			throw new Error('SuiteCloud Developer Assistant proxy is already running.');
		}
		this._outputProcessor.reset();
		this._lastExitCode = null;
		this._lastExitSignal = null;

		const portInUse = await this._isPortInUse(input.port);
		if (portInUse) {
			throw new Error(
				`Port ${input.port} is already in use by another process. Choose a different local port and retry.`
			);
		}

		const { createProxyStartEnvironment, getCliEntrypointPath } = require(
			'@oracle/suitecloud-cli/src/integration/DevAssistProxyIntegration'
		);
		const suitecloudScriptPath = getCliEntrypointPath();
		const args = [
			suitecloudScriptPath,
			'proxy:start',
			'--authid',
			input.authId,
			'--port',
			String(input.port),
		];

		let proxyProcess: ChildProcess;
		try {
			proxyProcess = this._spawnProcess(process.execPath, args, {
				cwd: input.cwd,
				env: createProxyStartEnvironment(input.sdkPath, process.env),
				stdio: ['ignore', 'pipe', 'pipe'],
			});
		} catch (error) {
			throw this._createSpawnError(error);
		}
		this._process = proxyProcess;
		this._startingProcesses.add(proxyProcess);

		const spawnFailure = this._createSpawnFailurePromise(proxyProcess);
		this._wireProcessOutput(proxyProcess);

		const pid = proxyProcess.pid ?? -1;
		this._callbacks.onLog(`Starting proxy process (pid: ${pid})...`);

		try {
			await Promise.race([
				this._waitForReadiness(input.port, proxyProcess),
				spawnFailure,
			]);
			this._startingProcesses.delete(proxyProcess);
			this._callbacks.onLog(`SuiteCloud proxy is listening on port ${input.port}.`);
			return pid;
		} catch (error) {
			this._startingProcesses.delete(proxyProcess);
			await this._terminateFailedStartupProcess(proxyProcess);
			throw error;
		}
	}

	async stop(): Promise<void> {
		if (!this._process) {
			return;
		}

		const processToStop = this._process;
		const pid = processToStop.pid;
		this._callbacks.onLog(pid ? `Stopping proxy process (pid: ${pid})...` : 'Stopping proxy process...');

		try {
			processToStop.kill('SIGTERM');
		} catch {
			// best effort
		}

		const exitedGracefully = await this._waitForExit(processToStop, STOP_TIMEOUT_MS);
		if (!exitedGracefully && pid) {
			if (process.platform === 'win32') {
				await this._forceKillWindowsProcess(pid);
			} else {
				try {
					process.kill(pid, 'SIGKILL');
				} catch {
					// process might already be terminated
				}
			}

			await this._waitForExit(processToStop, 1500);
		}

		this._process = undefined;
	}

	async dispose(): Promise<void> {
		await this.stop();
	}

	private _wireProcessOutput(proxyProcess: ChildProcess): void {
		proxyProcess.stdout?.on('data', (chunk: Buffer | string) => {
			this._outputProcessor.append('stdout', chunk);
		});

		proxyProcess.stderr?.on('data', (chunk: Buffer | string) => {
			this._outputProcessor.append('stderr', chunk);
		});

		proxyProcess.on('close', (code, signal) => {
			const spawnFailed = this._spawnFailedProcesses.delete(proxyProcess);
			this._lastExitCode = code;
			this._lastExitSignal = signal;
			this._outputProcessor.flush('stdout', true);
			this._outputProcessor.flush('stderr', true);

			if (this._process?.pid === proxyProcess.pid) {
				this._process = undefined;
			}
			if (!spawnFailed) {
				this._callbacks.onProcessClosed(code, signal);
			}
		});
	}

	private _createSpawnFailurePromise(proxyProcess: ChildProcess): Promise<never> {
		return new Promise((_, reject) => {
			proxyProcess.once('error', (error) => {
				if (this._startingProcesses.delete(proxyProcess)) {
					this._spawnFailedProcesses.add(proxyProcess);
				}
				if (this._process === proxyProcess) {
					this._process = undefined;
				}
				reject(this._createSpawnError(error));
			});
		});
	}

	private _createSpawnError(error: unknown): Error {
		const details = error instanceof Error ? error.message : String(error);
		return new Error(`Unable to start SuiteCloud proxy process: ${details}`);
	}

	private async _waitForReadiness(
		port: number,
		proxyProcess: ChildProcess
	): Promise<void> {
		const startedAt = Date.now();
		const startupError = () => {
			const details = this._outputProcessor.getDiagnosticDetails();
			const exitDetails = this._formatExitDetails();
			if (details) {
				return `Failed to start proxy${exitDetails ? ` ${exitDetails}` : ''}.\n${details}`;
			}
			return `Failed to start proxy process${exitDetails ? ` ${exitDetails}` : ''}.`;
		};

		while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
			if (!this._process || this._process.pid !== proxyProcess.pid || proxyProcess.killed) {
				throw new Error(startupError());
			}

			if (await this._isPortInUse(port)) {
				return;
			}

			await this._sleep(500);
		}

		throw new Error('Timed out while waiting for SuiteCloud Developer Assistant proxy to become ready.');
	}

	private _sleep(milliseconds: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	private _waitForExit(proxyProcess: ChildProcess, timeoutMs: number): Promise<boolean> {
		return new Promise((resolve) => {
			let settled = false;
			const timeout = setTimeout(() => {
				if (!settled) {
					settled = true;
					resolve(false);
				}
			}, timeoutMs);

			proxyProcess.once('exit', () => {
				if (settled) {
					return;
				}
				settled = true;
				clearTimeout(timeout);
				resolve(true);
			});
		});
	}

	private _forceKillWindowsProcess(pid: number): Promise<void> {
		return new Promise((resolve) => {
			const taskKill = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
				windowsHide: true,
				stdio: 'ignore',
			});
			taskKill.on('exit', () => resolve());
			taskKill.on('error', () => resolve());
		});
	}

	private _formatExitDetails(): string {
		if (this._lastExitCode === null && !this._lastExitSignal) {
			return '';
		}
		const codeText = this._lastExitCode !== null ? `code ${this._lastExitCode}` : 'unknown code';
		const signalText = this._lastExitSignal ? `, signal ${this._lastExitSignal}` : '';
		return `(exit ${codeText}${signalText})`;
	}

	private async _terminateFailedStartupProcess(proxyProcess: ChildProcess): Promise<void> {
		if (!proxyProcess || proxyProcess.killed || !proxyProcess.pid) {
			return;
		}

		try {
			proxyProcess.kill('SIGTERM');
		} catch {
			// best effort
		}

		const exitedGracefully = await this._waitForExit(proxyProcess, STOP_TIMEOUT_MS);
		const failedStartupPid = proxyProcess.pid;
		if (!exitedGracefully && failedStartupPid) {
			if (process.platform === 'win32') {
				await this._forceKillWindowsProcess(failedStartupPid);
			} else {
				try {
					process.kill(failedStartupPid, 'SIGKILL');
				} catch {
					// process might already be terminated
				}
			}
			await this._waitForExit(proxyProcess, 1500);
		}
	}

	private _isPortInUse(port: number): Promise<boolean> {
		return new Promise((resolve) => {
			const server = net.createServer();

			const closeServer = () => {
				server.close(() => resolve(false));
			};

			server.once('error', (error: NodeJS.ErrnoException) => {
				if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
					resolve(true);
					return;
				}
				resolve(false);
			});

			server.once('listening', () => {
				closeServer();
			});

			server.listen(port, '127.0.0.1');
		});
	}
}
