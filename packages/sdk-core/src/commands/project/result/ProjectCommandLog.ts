/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { appendFile, stat } from 'node:fs/promises';
import { EOL } from 'node:os';
import { join, resolve } from 'node:path';
import type { OperationResult, ProjectCommandType } from '../../../api/project/ProjectCommand';
import { PROJECT } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';

const LOG_HEADER_SEPARATOR = ' -----------------------------------------------';
const JSON_INDENT = 2;

export type ProjectCommandLogInput = {
	command: ProjectCommandType;
	logFileLocation: string;
	operationResult: OperationResult;
};

export async function writeProjectCommandLog(input: ProjectCommandLogInput): Promise<string> {
	const timestamp = formatTimestamp(new Date());
	const requestedPath = resolve(input.logFileLocation);
	let logFilePath: string | undefined;

	try {
		logFilePath = await resolveLogFilePath(requestedPath, timestamp);
		await appendFile(
			logFilePath,
			formatLogEntry(input.command, timestamp, input.operationResult),
			'utf8'
		);
	} catch (error: unknown) {
		throw new Error(
			translationService.getMessage(
				PROJECT.ERROR.LOG_WRITE_FAILED,
				logFilePath || requestedPath,
				toErrorMessage(error)
			)
		);
	}

	return logFilePath;
}

async function resolveLogFilePath(requestedPath: string, timestamp: string): Promise<string> {
	try {
		const pathStats = await stat(requestedPath);
		return pathStats.isDirectory() ? join(requestedPath, `log_${timestamp}.log`) : requestedPath;
	} catch (error: unknown) {
		if (hasErrorCode(error, 'ENOENT')) {
			return requestedPath;
		}
		throw error;
	}
}

function formatLogEntry(command: ProjectCommandType, timestamp: string, operationResult: OperationResult): string {
	const lines: string[] = [];
	if (operationResult.status === 'SUCCESS' && operationResult.resultMessage) {
		lines.push(operationResult.resultMessage);
	}

	const output = operationResult.status === 'ERROR'
		? operationResult.errorMessages
		: operationResult.data;
	appendOutput(lines, output);

	const header = `!${command.toUpperCase()} - ${timestamp}${LOG_HEADER_SEPARATOR}`;
	const body = lines.join(EOL);
	return `${header}${EOL}${body}${body ? EOL : ''}${EOL}${EOL}`;
}

function appendOutput(lines: string[], output: unknown): void {
	if (output === undefined || output === null) {
		return;
	}
	if (Array.isArray(output)) {
		output.forEach((entry) => lines.push(formatOutput(entry)));
		return;
	}
	lines.push(formatOutput(output));
}

function formatOutput(output: unknown): string {
	return typeof output === 'string' ? output : JSON.stringify(output, null, JSON_INDENT);
}

function formatTimestamp(date: Date): string {
	const twelveHour = date.getHours() % 12 || 12;
	return [
		date.getFullYear(),
		pad(date.getMonth() + 1),
		pad(date.getDate()),
		pad(twelveHour),
		pad(date.getMinutes()),
		pad(date.getSeconds()),
	].join('');
}

function pad(value: number): string {
	return String(value).padStart(2, '0');
}

function hasErrorCode(error: unknown, code: string): boolean {
	return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
