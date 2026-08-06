/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const sourceExcludedDirectories = new Set(['.git', 'node_modules', 'dist']);
const generatedExcludedDirectories = new Set(['.git', 'node_modules']);

// These intentionally target only credential-shaped values. They are not a replacement
// for a dedicated secrets scanner with entropy detection and provider-specific rules.
const secretPatterns = [
	['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/g],
	['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
	['private key', /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----\s*[A-Za-z0-9+/=\r\n]{128,}/g],
	['bearer credential', /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}\b/gi],
];

function relativePath(root, file) {
	return path.relative(root, file).split(path.sep).join('/');
}

async function regularFiles(root, excludedDirectories) {
	const files = [];
	async function visit(directory) {
		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				if (!excludedDirectories.has(entry.name)) await visit(entryPath);
			} else if (entry.isFile()) {
				files.push(entryPath);
			}
		}
	}
	await visit(root);
	return files.sort();
}

export async function scanSecrets(directory, { source = false } = {}) {
	const root = path.resolve(directory);
	const findings = [];
	for (const file of await regularFiles(root, source ? sourceExcludedDirectories : generatedExcludedDirectories)) {
		const contents = await fs.readFile(file, 'utf8');
		if (contents.includes('\0')) continue;
		for (const [kind, pattern] of secretPatterns) {
			pattern.lastIndex = 0;
			const match = pattern.exec(contents);
			if (match) findings.push({ file: relativePath(root, file), kind, line: contents.slice(0, match.index).split('\n').length });
		}
	}
	return findings;
}

function yamlValue(value) {
	return value.trim().replace(/\s+#.*$/, '').replace(/^(?:'([^]*)'|"([^]*)")$/, '$1$2');
}

function indentation(line) {
	return line.length - line.trimStart().length;
}

function isPinnedAction(reference) {
	return /^[^@\s]+@[0-9a-f]{40}$/.test(reference);
}

export async function scanWorkflowPolicies(directory) {
	const root = path.resolve(directory);
	const workflowFiles = (await regularFiles(root, new Set())).filter((file) => /\.ya?ml$/i.test(file));
	const findings = [];
	for (const file of workflowFiles) {
		const lines = (await fs.readFile(file, 'utf8')).split(/\r?\n/);
		const displayFile = relativePath(root, file);
		if (!lines.some((line) => /^permissions\s*:/.test(line))) {
			findings.push({ file: displayFile, kind: 'missing explicit top-level permissions' });
		}
		for (let index = 0; index < lines.length; index += 1) {
			const uses = lines[index].match(/^\s*-?\s*uses\s*:\s*(.+)$/);
			if (!uses) continue;
			const reference = yamlValue(uses[1]);
			if (!reference.startsWith('./') && !isPinnedAction(reference)) {
				findings.push({ file: displayFile, kind: `unpinned external action: ${reference}`, line: index + 1 });
			}
			if (!reference.startsWith('actions/checkout@')) continue;
			const stepIndent = indentation(lines[index]);
			let disablesCredentials = false;
			for (let next = index + 1; next < lines.length; next += 1) {
				if (/^\s*-\s/.test(lines[next]) && indentation(lines[next]) <= stepIndent) break;
				const persisted = lines[next].match(/^\s*persist-credentials\s*:\s*(.+)$/);
				if (persisted && /^false$/i.test(yamlValue(persisted[1]))) disablesCredentials = true;
			}
			if (!disablesCredentials) findings.push({ file: displayFile, kind: 'checkout persists credentials', line: index + 1 });
		}
	}
	return findings;
}

function formatFindings(label, findings) {
	return `${label} failed:\n${findings.map((finding) => `- ${finding.file}${finding.line ? `:${finding.line}` : ''}: ${finding.kind}`).join('\n')}`;
}

async function main() {
	const [command, directory] = process.argv.slice(2);
	if (!directory || !['secrets', 'workflows'].includes(command)) {
		throw new Error('Usage: node release-security-gates.mjs <secrets|workflows> <directory>');
	}
	const findings = command === 'secrets'
		? await scanSecrets(directory, { source: path.resolve(directory) === path.resolve('.') })
		: await scanWorkflowPolicies(directory);
	if (findings.length) throw new Error(formatFindings(command === 'secrets' ? 'Secret scan' : 'Workflow policy check', findings));
	console.log(`${command} gate passed: ${directory}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
