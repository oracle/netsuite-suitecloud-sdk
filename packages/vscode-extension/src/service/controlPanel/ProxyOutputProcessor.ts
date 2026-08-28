/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export type ProxyOutputStream = 'stdout' | 'stderr';

const MAX_LOG_HISTORY_LINES = 80;
const CLI_USAGE_GUIDANCE_START = 'To use it on this machine, configure your third-party tool as follows:';
const CLI_USAGE_GUIDANCE_END = 'Press Ctrl+C to stop the proxy.';

export default class ProxyOutputProcessor {
	private readonly _onLog: (line: string, isError?: boolean) => void;
	private _stdoutBuffer = '';
	private _stderrBuffer = '';
	private _recentOutputLines: string[] = [];
	private _hasEmittedOutputLine = false;
	private _lastOutputWasBlank = false;
	private _isSkippingCliUsageGuidance = false;

	constructor(onLog: (line: string, isError?: boolean) => void) {
		this._onLog = onLog;
	}

	reset(): void {
		this._stdoutBuffer = '';
		this._stderrBuffer = '';
		this._recentOutputLines = [];
		this._hasEmittedOutputLine = false;
		this._lastOutputWasBlank = false;
		this._isSkippingCliUsageGuidance = false;
	}

	append(stream: ProxyOutputStream, chunk: Buffer | string): void {
		if (stream === 'stdout') {
			this._stdoutBuffer += chunk.toString();
		} else {
			this._stderrBuffer += chunk.toString();
		}
		this.flush(stream);
	}

	flush(stream: ProxyOutputStream, flushAll = false): void {
		const buffer = stream === 'stdout' ? this._stdoutBuffer : this._stderrBuffer;
		const parts = buffer.split(/\r?\n|\r/);
		const remainder = parts.pop() || '';
		const isError = stream === 'stderr';

		parts.forEach((line) => this._emitLine(line, isError));

		if (stream === 'stdout') {
			this._stdoutBuffer = flushAll ? '' : remainder;
		} else {
			this._stderrBuffer = flushAll ? '' : remainder;
		}

		if (flushAll && remainder.trim()) {
			this._emitLine(remainder, isError);
		}
	}

	getDiagnosticDetails(): string {
		const recentDetails = this._recentOutputLines.slice(-6).join('\n');
		return recentDetails || this._stderrBuffer.trim() || this._stdoutBuffer.trim();
	}

	private _emitLine(line: string, isError: boolean): void {
		const normalizedLine = this._sanitizeLine(line);
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
				this._onLog('', isError);
				this._lastOutputWasBlank = true;
			}
			return;
		}

		this._hasEmittedOutputLine = true;
		this._lastOutputWasBlank = false;
		this._recordLine(normalizedLine, isError);
		this._onLog(normalizedLine, isError);
	}

	private _sanitizeLine(line: string): string {
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

	private _recordLine(line: string, isError: boolean): void {
		this._recentOutputLines.push(`${isError ? 'stderr' : 'stdout'}: ${line}`);
		if (this._recentOutputLines.length > MAX_LOG_HISTORY_LINES) {
			this._recentOutputLines.shift();
		}
	}
}
