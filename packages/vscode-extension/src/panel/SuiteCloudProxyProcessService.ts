/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as net from 'net';
import { ChildProcess, spawn } from 'child_process';

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
const MAX_LOG_HISTORY_LINES = 80;
const CLI_USAGE_GUIDANCE_START = 'To use it on this machine, configure your third-party tool as follows:';
const CLI_USAGE_GUIDANCE_END = 'Press Ctrl+C to stop the proxy.';

export default class SuiteCloudProxyProcessService {
	private _process?: ChildProcess;
	private readonly _callbacks: ProxyProcessCallbacks;
	private readonly _spawnProcess: typeof spawn;
	private readonly _startingProcesses = new WeakSet<ChildProcess>();
	private readonly _spawnFailedProcesses = new WeakSet<ChildProcess>();
	private _stdoutBuffer = '';
	private _stderrBuffer = '';
	private _recentOutputLines: string[] = [];
	private _lastExitCode: number | null = null;
	private _lastExitSignal: NodeJS.Signals | null = null;
	private _hasEmittedOutputLine = false;
	private _lastOutputWasBlank = false;
	private _isSkippingCliUsageGuidance = false;

	constructor(callbacks: ProxyProcessCallbacks, spawnProcess: typeof spawn = spawn) {
		this._callbacks = callbacks;
		this._spawnProcess = spawnProcess;
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
		this._stdoutBuffer = '';
		this._stderrBuffer = '';
		this._recentOutputLines = [];
		this._lastExitCode = null;
		this._lastExitSignal = null;
		this._hasEmittedOutputLine = false;
		this._lastOutputWasBlank = false;
		this._isSkippingCliUsageGuidance = false;

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
			const content = chunk.toString();
			this._stdoutBuffer += content;
			this._flushLines('stdout');
		});

		proxyProcess.stderr?.on('data', (chunk: Buffer | string) => {
			const content = chunk.toString();
			this._stderrBuffer += content;
			this._flushLines('stderr');
		});

		proxyProcess.on('close', (code, signal) => {
			const spawnFailed = this._spawnFailedProcesses.delete(proxyProcess);
			this._lastExitCode = code;
			this._lastExitSignal = signal;
			this._flushLines('stdout', true);
			this._flushLines('stderr', true);

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

	private _flushLines(stream: 'stdout' | 'stderr', flushAll = false): void {
		const buffer = stream === 'stdout' ? this._stdoutBuffer : this._stderrBuffer;
		const parts = buffer.split(/\r?\n|\r/);
		const remainder = parts.pop() || '';
		const isError = stream === 'stderr';

		parts.forEach((line) => {
			this._emitOutputLine(line, isError);
		});

		if (stream === 'stdout') {
			this._stdoutBuffer = flushAll ? '' : remainder;
		} else {
			this._stderrBuffer = flushAll ? '' : remainder;
		}

		if (flushAll && remainder.trim()) {
			this._emitOutputLine(remainder, isError);
		}
	}

	private _emitOutputLine(line: string, isError: boolean): void {
		const normalizedLine = this._sanitizeOutputLine(line);
		// The panel renders equivalent guidance with panel-specific API key instructions.
		if (normalizedLine === CLI_USAGE_GUIDANCE_START) {
			this._isSkippingCliUsageGuidance = true;
			return;
		}
		if (this._isSkippingCliUsageGuidance) {
			if (normalizedLine === CLI_USAGE_GUIDANCE_END) {
				this._isSkippingCliUsageGuidance = false;
			}
			return;
		}
		if (!normalizedLine) {
			if (this._hasEmittedOutputLine && !this._lastOutputWasBlank) {
				this._callbacks.onLog('', isError);
				this._lastOutputWasBlank = true;
			}
			return;
		}

		this._hasEmittedOutputLine = true;
		this._lastOutputWasBlank = false;
		this._recordOutputLine(normalizedLine, isError);
		this._callbacks.onLog(normalizedLine, isError);
	}

	private _sanitizeOutputLine(line: string): string {
		if (!line) {
			return '';
		}
		return line
			// OSC sequences (e.g., ESC ] ... BEL / ESC \)
			.replace(/\u001B\][^\u0007]*(?:\u0007|\u001B\\)/g, '')
			// CSI sequences (e.g., ESC [ 2K, ESC [ 1G)
			.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
			// 2-char escape sequences (e.g., ESC c)
			.replace(/\u001B[@-_]/g, '')
			// Strip remaining non-printable control chars (except newline/carriage-return, already split)
			.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
			.trim();
	}

	private async _waitForReadiness(
		port: number,
		proxyProcess: ChildProcess
	): Promise<void> {
		const startedAt = Date.now();
		const startupError = () => {
			const recentDetails = this._recentOutputLines.slice(-6).join('\n');
			const fallbackDetails = this._stderrBuffer.trim() || this._stdoutBuffer.trim();
			const details = recentDetails || fallbackDetails;
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

	private _recordOutputLine(line: string, isError: boolean): void {
		const normalizedLine = line.trim();
		if (!normalizedLine) {
			return;
		}

		this._recentOutputLines.push(`${isError ? 'stderr' : 'stdout'}: ${normalizedLine}`);
		if (this._recentOutputLines.length > MAX_LOG_HISTORY_LINES) {
			this._recentOutputLines.shift();
		}
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
