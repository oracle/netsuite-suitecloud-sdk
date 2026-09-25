/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { PROJECT_API } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';

const TEXT = PROJECT_API.ANALYZER;
const LEVELS = ['error', 'warning', 'note', 'none'] as const;
type RecordValue = Record<string, any>;

export function getAnalyzerReportError(report: unknown): string | undefined {
	if (report === undefined || report === null) {
		return translationService.getMessage(TEXT.MISSING);
	}
	if (!isRecord(report) || report.version !== '2.1.0' || !Array.isArray(report.runs) || report.runs.length === 0) {
		return translationService.getMessage(TEXT.INVALID);
	}
	for (const run of report.runs) {
		if (!isRecord(run) || !isRecord(run.tool?.driver) || !Array.isArray(run.results)
			|| run.results.some((result: unknown) => !isRecord(result) || !isRecord(result.message))) {
			return translationService.getMessage(TEXT.INVALID);
		}
		if (!Array.isArray(run.invocations) || run.invocations.length === 0
			|| run.invocations.some((invocation: unknown) => !isRecord(invocation) || invocation.executionSuccessful !== true)) {
			return translationService.getMessage(TEXT.INCOMPLETE);
		}
	}
	return undefined;
}

export type AnalyzerFinding = {
	level: typeof LEVELS[number]; ruleId: string; title: string; message: string; locations: string[];
};

export function normalizeAnalyzerFindings(report: unknown): AnalyzerFinding[] {
	if (getAnalyzerReportError(report)) return [];
	const findings: AnalyzerFinding[] = [];
	for (const run of (report as RecordValue).runs) {
		const rules: RecordValue[] = Array.isArray(run.tool.driver.rules) ? run.tool.driver.rules : [];
		for (const result of run.results) {
			const rule = rules.find(candidate => isRecord(candidate) && candidate.id === result.ruleId)
				?? (Number.isInteger(result.ruleIndex) && isRecord(rules[result.ruleIndex]) ? rules[result.ruleIndex] : undefined);
			const requestedLevel = result.level ?? rule?.defaultConfiguration?.level ?? 'warning';
			const level = LEVELS.includes(requestedLevel) ? requestedLevel as typeof LEVELS[number] : 'warning';
			findings.push({ level, ruleId: text(result.ruleId) || text(rule?.id),
				title: text(rule?.shortDescription?.text) || text(rule?.name) || 'Security finding',
				message: resolveMessage(result.message, rule, run.tool.driver),
				locations: Array.isArray(result.locations) ? result.locations.filter(isRecord).map(formatLocation).filter(Boolean) : [],
			});
		}
	}
	return findings.sort((a, b) => (a.locations[0] || '').localeCompare(b.locations[0] || '')
		|| LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.ruleId.localeCompare(b.ruleId) || a.message.localeCompare(b.message));
}

export function formatAnalyzerReport(report: unknown, options: { includeHeading?: boolean } = {}): string[] {
	const heading = options.includeHeading === false ? [] : [translationService.getMessage(TEXT.SUMMARY)];
	const error = getAnalyzerReportError(report);
	if (error) return ['', ...heading, 'ERROR: ' + error];
	const findings = normalizeAnalyzerFindings(report);
	const counts = { error: 0, warning: 0, note: 0, none: 0 };
	findings.forEach(finding => counts[finding.level]++);
	const countKeys = { error: [TEXT.ERROR, TEXT.ERRORS], warning: [TEXT.WARNING, TEXT.WARNINGS],
		note: [TEXT.NOTE, TEXT.NOTES], none: [TEXT.NONE, TEXT.NONES] };
	const summary = LEVELS.filter(level => level === 'error' || level === 'warning' || counts[level] > 0)
		.map(level => translationService.getMessage(countKeys[level][counts[level] === 1 ? 0 : 1], counts[level])).join(' · ');
	const lines = [...(heading.length ? ['', ...heading] : []), summary];
	if (!findings.length) lines.push(translationService.getMessage(TEXT.CLEAN));
	let previousFile: string | undefined;
	for (const finding of findings) {
		const location = finding.locations[0] || 'General';
		const file = location.replace(/:[0-9]+(?::[0-9]+)?$/, '');
		if (file !== previousFile) { lines.push('', file); previousFile = file; }
		const position = location.slice(file.length);
		lines.push('  ' + finding.level.toUpperCase() + ': ' + finding.title + (position ? ' (' + position.slice(1) + ')' : ''));
		lines.push(...wrapText(finding.message, 96).map(line => '    ' + line));
		if (finding.ruleId) lines.push('    Rule: ' + finding.ruleId);
		for (const additional of finding.locations.slice(1)) lines.push('    Also: ' + additional);
	}
	lines.push('', translationService.getMessage(TEXT.ADVISORY));
	return lines;
}

function wrapText(value: string, width: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of value.split(/\s+/)) {
		if (line && line.length + word.length + 1 > width) { lines.push(line); line = ''; }
		line += (line ? ' ' : '') + word;
	}
	if (line) lines.push(line);
	return lines;
}

function resolveMessage(message: RecordValue, rule: RecordValue | undefined, driver: RecordValue): string {
	const template = text(message.text) || text(message.markdown)
		|| text(rule?.messageStrings?.[message.id]?.text)
		|| text(driver.globalMessageStrings?.[message.id]?.text)
		|| translationService.getMessage(TEXT.NO_MESSAGE);
	return template.replace(/\{(\d+)\}/g, (placeholder, index) =>
		Array.isArray(message.arguments) && message.arguments[Number(index)] !== undefined
			? String(message.arguments[Number(index)]) : placeholder);
}

function formatLocation(location: RecordValue): string {
	const physical = location.physicalLocation;
	const uri = text(physical?.artifactLocation?.uri);
	const line = physical?.region?.startLine;
	const column = physical?.region?.startColumn;
	return uri ? `${uri}${Number.isInteger(line) && line > 0 ? `:${line}${Number.isInteger(column) && column > 0 ? `:${column}` : ''}` : ''}` : '';
}

function text(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is RecordValue {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
