/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { ProjectCommandSummaryContext, ProjectCommandType } from './ProjectCommandTypes';

const STEP_STATUS_SUCCESSFUL = 'SUCCESSFUL';
const STEP_STATUS_MARK_SUCCESS = '✔';
const STEP_STATUS_MARK_FAILED = '✖';
const VALIDATION_RESULT_TYPE_WARNING = 'WARNING';
const VALIDATION_RESULT_TYPE_ERROR = 'ERROR';
const COMMAND_OUTPUT_SEPARATOR_LINE = '------------------------------------------------------------';

export function formatSdfProjectResultOutput(
	command: ProjectCommandType,
	payload: Record<string, unknown>,
	options: {
		summaryContext?: ProjectCommandSummaryContext;
		serverTimestamp?: string;
	} = {}
): { lines: string[]; hasFailures: boolean } {
	const evaluationSummary = evaluateSdfProjectPayload(payload);
	const validationLines = formatSdfProjectValidationResults(payload.validationResults);
	const summaryMetadataLines = buildSummaryMetadataLines(payload, options);
	const lines = [
		`${command.toUpperCase()} SUMMARY`,
		`Status: ${evaluationSummary.hasFailures ? 'FAILED' : 'SUCCESS'}`,
		`Steps: ${evaluationSummary.successfulSteps}/${evaluationSummary.totalSteps} successful`,
		`Validation Results: ${evaluationSummary.errorResults} error(s), ${evaluationSummary.warningResults} warning(s)`,
		`SDF Errors: ${evaluationSummary.hasEndpointError ? 'present' : 'none'}`,
		...summaryMetadataLines,
		COMMAND_OUTPUT_SEPARATOR_LINE,
		...formatSdfProjectSteps(payload.steps),
		...validationLines,
	];
	const endpointErrorMessage = asStringOrUndefined(payload.errorMessage);
	if (endpointErrorMessage && endpointErrorMessage.trim()) {
		lines.push(...formatEndpointErrorSection(endpointErrorMessage, validationLines.length > 0));
	}
	return { lines, hasFailures: evaluationSummary.hasFailures };
}

export function evaluateSdfProjectPayload(payload: Record<string, unknown>): {
	totalSteps: number;
	successfulSteps: number;
	warningResults: number;
	errorResults: number;
	hasEndpointError: boolean;
	hasFailures: boolean;
} {
	const normalizedSteps = normalizeSdfProjectSteps(payload.steps);
	const normalizedValidationResults = normalizeSdfProjectValidationResults(payload.validationResults);
	const totalSteps = normalizedSteps.length;
	const failedSteps = normalizedSteps.filter((step) => step.status !== STEP_STATUS_SUCCESSFUL).length;
	const successfulSteps = totalSteps - failedSteps;
	const warningResults = normalizedValidationResults.filter((result) => result.type === VALIDATION_RESULT_TYPE_WARNING).length;
	const errorResults = normalizedValidationResults.filter((result) => result.type === VALIDATION_RESULT_TYPE_ERROR).length;
	const endpointErrorMessage = asStringOrUndefined(payload.errorMessage);
	const hasEndpointError = !!(endpointErrorMessage && endpointErrorMessage.trim());
	return {
		totalSteps,
		successfulSteps,
		warningResults,
		errorResults,
		hasEndpointError,
		hasFailures: failedSteps > 0 || errorResults > 0 || hasEndpointError,
	};
}

function normalizeSdfProjectSteps(steps: unknown): Array<{ name: string; status: string }> {
	if (!Array.isArray(steps)) {
		return [];
	}
	return steps.reduce<Array<{ name: string; status: string }>>((acc, step) => {
		if (!isRecord(step)) {
			return acc;
		}
		const name = asStringOrUndefined(step.name);
		const status = asStringOrUndefined(step.status);
		if (name && status) {
			acc.push({ name, status });
		}
		return acc;
	}, []);
}

function normalizeSdfProjectValidationResults(validationResults: unknown): Array<{ type: string; message: string; component?: string }> {
	if (!Array.isArray(validationResults)) {
		return [];
	}
	return validationResults.reduce<Array<{ type: string; message: string; component?: string }>>((acc, validationResult) => {
		if (!isRecord(validationResult)) {
			return acc;
		}
		const message = asStringOrUndefined(validationResult.message);
		if (!message) {
			return acc;
		}
		const type = asStringOrUndefined(validationResult.type);
		const normalizedType =
			type === VALIDATION_RESULT_TYPE_ERROR || type === VALIDATION_RESULT_TYPE_WARNING ? type : VALIDATION_RESULT_TYPE_WARNING;
		acc.push({ type: normalizedType, message, component: extractValidationComponent(validationResult.validationDetails) });
		return acc;
	}, []);
}

function formatSdfProjectSteps(steps: unknown): string[] {
	if (!Array.isArray(steps)) {
		return [];
	}
	return steps.reduce<string[]>((lines, step, index) => {
		if (!isRecord(step)) {
			return lines;
		}
		const name = asStringOrUndefined(step.name);
		if (!name) {
			return lines;
		}
		const statusMark = step.status === STEP_STATUS_SUCCESSFUL ? STEP_STATUS_MARK_SUCCESS : STEP_STATUS_MARK_FAILED;
		lines.push(`${statusMark} Step ${index + 1}: ${name}`);
		return lines;
	}, []);
}

function formatSdfProjectValidationResults(validationResults: unknown): string[] {
	const normalizedValidationResults = normalizeSdfProjectValidationResults(validationResults);
	if (normalizedValidationResults.length === 0) {
		return [];
	}
	const sections: string[] = ['', 'Issues by file:'];
	const grouped = new Map<string, { errors: Set<string>; warnings: Set<string> }>();
	normalizedValidationResults.forEach((result) => {
		const fileKey = result.component || 'General';
		if (!grouped.has(fileKey)) {
			grouped.set(fileKey, { errors: new Set<string>(), warnings: new Set<string>() });
		}
		const bucket = grouped.get(fileKey) as { errors: Set<string>; warnings: Set<string> };
		if (result.type === VALIDATION_RESULT_TYPE_ERROR) {
			bucket.errors.add(result.message);
		} else {
			bucket.warnings.add(result.message);
		}
	});

	const orderedEntries = Array.from(grouped.entries()).sort((a, b) => {
		if (a[0] === 'General') return -1;
		if (b[0] === 'General') return 1;
		return a[0].localeCompare(b[0]);
	});

	orderedEntries.forEach(([fileKey, bucket], index) => {
		const errorCount = bucket.errors.size;
		const warningCount = bucket.warnings.size;
		sections.push(`${index + 1}. ${fileKey} (${errorCount} error(s), ${warningCount} warning(s))`);
		Array.from(bucket.errors).forEach((message) => sections.push(`  - ERROR: ${message}`));
		Array.from(bucket.warnings).forEach((message) => sections.push(`  - WARNING: ${message}`));
		sections.push('');
	});
	if (sections[sections.length - 1] === '') {
		sections.pop();
	}
	return sections;
}

function extractValidationComponent(validationDetails: unknown): string | undefined {
	if (!isRecord(validationDetails)) {
		return undefined;
	}
	return asStringOrUndefined(validationDetails.component);
}

function asStringOrUndefined(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

function formatEndpointErrorSection(endpointErrorMessage: string, hasValidationLines: boolean): string[] {
	if (hasValidationLines && endpointErrorMessage.includes('An error occurred during custom object validation.')) {
		return [];
	}
	const compactObjectValidationLines = extractCompactObjectValidationErrors(endpointErrorMessage);
	if (compactObjectValidationLines.length > 0) {
		return ['', 'Additional endpoint details:', ...compactObjectValidationLines];
	}

	const firstMeaningfulLine = endpointErrorMessage
		.split(/\r?\n/)
		.map((line) => line.trim())
		.find((line) => line.length > 0);
	return firstMeaningfulLine ? [`ERROR: ${firstMeaningfulLine}`] : [];
}

function extractCompactObjectValidationErrors(endpointErrorMessage: string): string[] {
	const lines = endpointErrorMessage.split(/\r?\n/);
	const output: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(/^An error occurred during custom object validation\.\s*\(([^)]+)\)/);
		if (!match) {
			continue;
		}
		const objectId = match[1];
		const details: string[] = [];
		let filePath: string | undefined;
		let j = i + 1;
		while (j < lines.length) {
			const current = lines[j].trim();
			if (!current || current.startsWith('An error occurred during custom object validation.')) {
				break;
			}
			if (current.startsWith('Details:')) {
				details.push(current.replace(/^Details:\s*/, '').trim());
			} else if (current.startsWith('File:')) {
				filePath = current.replace(/^File:\s*/, '').trim();
			}
			j++;
		}
		const detailPreview = details.slice(0, 2).join(' | ');
		const location = filePath ? ` @ ${filePath}` : '';
		output.push(`- ${objectId}${location}${detailPreview ? ` -> ${detailPreview}` : ''}`);
		i = j - 1;
	}
	return output;
}

function isRecord(value: unknown): value is Record<string, any> {
	return typeof value === 'object' && value !== null;
}

function buildSummaryMetadataLines(
	payload: Record<string, unknown>,
	options: { summaryContext?: ProjectCommandSummaryContext; serverTimestamp?: string }
): string[] {
	const summaryContext = options.summaryContext || {};
	const localTimestamp = normalizeTimestamp(summaryContext.localTimestamp) || new Date().toISOString();
	const lines = [`Local Timestamp: ${localTimestamp}`];

	if (summaryContext.accountName) {
		lines.push(`Account: ${summaryContext.accountName}`);
	}
	if (summaryContext.roleName) {
		lines.push(`Role: ${summaryContext.roleName}`);
	}
	if (summaryContext.suiteAppId) {
		lines.push(`SuiteApp ID: ${summaryContext.suiteAppId}`);
	} else if (summaryContext.projectName) {
		lines.push(`Project Name: ${summaryContext.projectName}`);
	}

	return lines;
}

function resolveServerTimestampFromPayload(payload: Record<string, unknown>): string | undefined {
	const candidates: unknown[] = [
		payload.serverTimestamp,
		payload.serverTime,
		payload.timeStamp,
		payload.timestamp,
		payload.date,
		payload.requestTimestamp,
	];

	for (const candidate of candidates) {
		const normalizedCandidate = normalizeTimestamp(candidate);
		if (normalizedCandidate) {
			return normalizedCandidate;
		}
	}

	return undefined;
}

function normalizeTimestamp(value: unknown): string | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		const fromEpoch = new Date(value);
		return Number.isNaN(fromEpoch.getTime()) ? undefined : fromEpoch.toISOString();
	}
	if (typeof value !== 'string') {
		return undefined;
	}
	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return undefined;
	}
	const parsedDate = new Date(trimmedValue);
	if (Number.isNaN(parsedDate.getTime())) {
		return trimmedValue;
	}
	return parsedDate.toISOString();
}
