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
const WARNING_LINE_PATTERN = /^(?:\s*-?\s*)?WARNING:/;
const ERROR_LINE_PATTERN = /^\s*ERROR:/;
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
	'Issues by file:',
	'Analyzer findings:',
	'SuiteApp Analyzer:',
	'SDF validation:',
	'Analyzer findings are advisory',
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
		let isAnalyzerSection = false;
		payload.forEach((line) => {
			const outputLine = String(line);
			if (isAnalyzerHeading(outputLine)) isAnalyzerSection = true;
			if (SUMMARY_LINE_PATTERN.test(outputLine) || outputLine === SEPARATOR_LINE) {
				isInIssuesByFileSection = false;
			}
			if (outputLine === ISSUES_BY_FILE_LINE) {
				logLine(log, outputLine, false);
				isInIssuesByFileSection = hasWarningOnlyIssues;
				return;
			}
			logLine(log, outputLine, isInIssuesByFileSection && !isAnalyzerSection, isAnalyzerSection);
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
	let isAnalyzerSection = false;
	errorMessages.forEach((errorMessage) => {
		const line = String(errorMessage);
		if (isAnalyzerHeading(line)) isAnalyzerSection = true;
		if (isAnalyzerSection) logLine(log, line, false, true);
		else logErrorLine(log, line);
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

function logLine(log, line, isWarningOnlyIssue, isAnalyzerSection = false) {
	if (logSectionLine(log, line)) return;
	if (isAnalyzerSection) {
		logAnalyzerLine(log, line);
		return;
	}
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

function isAnalyzerHeading(line) {
	return line === 'SUITEAPP ANALYZER SUMMARY' || line.startsWith('SuiteApp Analyzer:') || line.startsWith('SuiteApp analysis');
}

function logAnalyzerLine(log, line) {
	const severity = line.match(/^(\s*)(ERROR|WARNING|NOTE|NONE)(:)(.*)$/);
	let parts;
	if (severity) {
		const style = severity[2] === 'ERROR' ? 'error' : severity[2] === 'WARNING' ? 'warning' : 'dim';
		parts = [{ text: severity[1] }, { text: severity[2] + severity[3], style }, { text: severity[4] }];
	} else if (/^\d+ errors? · \d+ warnings?/.test(line)) {
		parts = line.split(' · ').flatMap((text, index) => {
			const style = /^[1-9]\d* errors?$/.test(text) ? 'error' : /^[1-9]\d* warnings?$/.test(text) ? 'warning' : undefined;
			return [...(index ? [{ text: ' · ' }] : []), { text, style }];
		});
	} else {
		let style;
		if (line === 'SuiteApp analysis completed') style = 'result';
		else if (line === 'SuiteApp analysis failed' || line === 'SuiteApp Analyzer: FAILED') style = 'error';
		else if (/^\s+Rule:/.test(line) || line.startsWith('Analyzer findings are advisory') || line.startsWith('SuiteApp Analyzer: SKIPPED') || line.startsWith('To run SDF validation only,')) style = 'dim';
		else if (line && !/^\s/.test(line) && !line.startsWith('Analyzer findings:') && !line.startsWith('No security findings')) style = 'bold';
		parts = [{ text: line, style }];
	}
	logStyledParts(log, line, parts);
}

function logSectionLine(log, line) {
	let style;
	if (line === SEPARATOR_LINE) style = 'dim';
	else if (line === 'SDF validation') style = 'bold';
	else if (line === 'SDF validation: PASSED') style = 'result';
	else if (line === 'SDF validation: FAILED') style = 'error';
	else return false;
	logStyledParts(log, line, [{ text: line, style }]);
	return true;
}

function logStyledParts(log, line, parts) {
	if (typeof log.styled === 'function') log.styled(parts);
	else if (typeof log.plain === 'function') log.plain(line);
	else log.info(line);
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
	if (logSectionLine(log, line)) return;
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
