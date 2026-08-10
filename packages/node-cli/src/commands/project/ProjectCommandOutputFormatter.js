/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const OUTPUT_FLAGS = {
	JSON: 'json',
};

const SUMMARY_LINE_PATTERN = /SUMMARY$/;
const STEP_SUCCESS_PATTERN = /^[✓✔] Step \d+:/;
const STEP_FAILURE_PATTERN = /^[✗✖] Step \d+:/;
const WARNING_LINE_PATTERN = /^(?:\s*-\s+)?WARNING:/;
const ERROR_LINE_PATTERN = /^ERROR:/;
const STATUS_SUCCESS_PATTERN = /^Status:\s+SUCCESS$/;
const STATUS_FAILURE_PATTERN = /^Status:\s+FAILED$/;
const ISSUES_BY_FILE_LINE = 'Issues by file:';
const ISSUE_FILE_SUMMARY_PATTERN = /^\d+\.\s+.+\s+\((\d+) error\(s\),\s+(\d+) warning\(s\)\)$/;
const NEUTRAL_SUMMARY_LINES = [
	'Steps:',
	'Validation Results:',
	'SDF Errors:',
	'SDF Validation Errors:',
	'Endpoint Errors:',
	'Timestamp:',
	'Account:',
	'Account ID:',
	'Role:',
	'SuiteApp ID:',
	'Project Name:',
	'Apply Installation Preferences:',
];
const SEPARATOR_LINE = '------------------------------------------------------------';
const JSON_INDENT = 2;

function isRawOutputRequested(actionResult) {
	if (!actionResult || !actionResult.commandParameters) {
		return false;
	}
	return !!actionResult.commandParameters[OUTPUT_FLAGS.JSON];
}

function logCommandOutput(log, payload) {
	if (payload === undefined || payload === null) {
		return;
	}

	if (Array.isArray(payload)) {
		const hasWarningOnlyIssues = containsWarningOnlyIssues(payload);
		let isInIssuesByFileSection = false;
		payload.forEach((line) => {
			const outputLine = String(line);
			if (outputLine === ISSUES_BY_FILE_LINE) {
				isInIssuesByFileSection = hasWarningOnlyIssues;
			}
			logLine(log, outputLine, isInIssuesByFileSection);
		});
		return;
	}

	if (typeof payload === 'string') {
		log.result(payload);
		return;
	}

	log.result(toJsonOutput(payload));
}

function logCommandErrors(log, errorMessages) {
	if (!Array.isArray(errorMessages)) {
		return;
	}
	errorMessages.forEach((errorMessage) => {
		logErrorLine(log, String(errorMessage));
	});
}

function logRawOutput(log, payload, isError) {
	const output = typeof payload === 'string' ? payload : toJsonOutput(payload);
	if (typeof log.plain === 'function') {
		log.plain(output);
		return;
	}
	log.info(output);
}

function logLine(log, line, isWarningOnlyIssue) {
	if (!line) {
		log.info('');
		return;
	}

	if (isWarningOnlyIssue) {
		log.warning(line);
		return;
	}

	if (STEP_FAILURE_PATTERN.test(line) || STATUS_FAILURE_PATTERN.test(line) || ERROR_LINE_PATTERN.test(line)) {
		log.error(line);
		return;
	}

	if (WARNING_LINE_PATTERN.test(line)) {
		log.warning(line);
		return;
	}

	if (STEP_SUCCESS_PATTERN.test(line) || STATUS_SUCCESS_PATTERN.test(line)) {
		log.result(line);
		return;
	}

	if (SUMMARY_LINE_PATTERN.test(line) || line === SEPARATOR_LINE || isNeutralSummaryLine(line)) {
		log.info(line);
		return;
	}

	log.result(line);
}

function containsWarningOnlyIssues(lines) {
	let hasWarning = false;

	for (const line of lines) {
		const match = String(line).match(ISSUE_FILE_SUMMARY_PATTERN);
		if (!match) {
			continue;
		}

		const errorCount = Number(match[1]);
		const warningCount = Number(match[2]);
		if (errorCount > 0) {
			return false;
		}
		if (warningCount > 0) {
			hasWarning = true;
		}
	}

	return hasWarning;
}

function logErrorLine(log, line) {
	if (!line) {
		log.error('');
		return;
	}

	if (SUMMARY_LINE_PATTERN.test(line) || line === SEPARATOR_LINE || isNeutralSummaryLine(line)) {
		log.info(line);
		return;
	}

	if (WARNING_LINE_PATTERN.test(line)) {
		log.warning(line);
		return;
	}

	if (STEP_SUCCESS_PATTERN.test(line) || STATUS_SUCCESS_PATTERN.test(line)) {
		log.result(line);
		return;
	}

	log.error(line);
}

function isNeutralSummaryLine(line) {
	return NEUTRAL_SUMMARY_LINES.some((prefix) => line.startsWith(prefix));
}

function toJsonOutput(value) {
	return JSON.stringify(value, null, JSON_INDENT);
}

module.exports = {
	isRawOutputRequested,
	logCommandOutput,
	logCommandErrors,
	logRawOutput,
};
