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
const WARNING_LINE_PATTERN = /^WARNING:/;
const ERROR_LINE_PATTERN = /^ERROR:/;
const STATUS_SUCCESS_PATTERN = /^Status:\s+SUCCESS$/;
const STATUS_FAILURE_PATTERN = /^Status:\s+FAILED$/;
const NEUTRAL_SUMMARY_LINES = [
	'Steps:',
	'Validation Results:',
	'SDF Errors:',
	'SDF Validation Errors:',
	'Endpoint Errors:',
	'Local Timestamp:',
	'Account:',
	'Role:',
	'SuiteApp ID:',
	'Project Name:',
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
		payload.forEach((line) => {
			logLine(log, String(line));
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

function logLine(log, line) {
	if (!line) {
		log.info('');
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
