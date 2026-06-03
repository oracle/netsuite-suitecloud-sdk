/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Diff = require('diff');

const DIFF_LINE_TYPE = {
	HEADER: 'header',
	HUNK: 'hunk',
	ADDED: 'added',
	REMOVED: 'removed',
	CONTEXT: 'context',
};

// chalk is ESM-only and is only consumed through the async dynamic-import logger (LoggerFontFormatter.mjs).
// A diff renderer needs to stay synchronous and self-contained so it can be unit tested without that machinery,
// so the colors are emitted as raw ANSI escape codes here, gated on a useColor flag the caller derives from the TTY.
const ANSI = {
	RESET: '\x1b[0m',
	RED: '\x1b[31m',
	GREEN: '\x1b[32m',
	CYAN: '\x1b[36m',
};

const DEFAULT_CONTEXT_LINES = 3;

class FileDifferenceUtils {
	/**
	 * Computes a git-style unified diff between the version of a file in the account and the local version.
	 * @param {string} accountContent Content of the file as it exists in the account File Cabinet.
	 * @param {string} localContent Content of the file in the local project.
	 * @param {Object} [options]
	 * @param {string} [options.accountLabel] Label shown in the "---" header (the removed/account side).
	 * @param {string} [options.localLabel] Label shown in the "+++" header (the added/local side).
	 * @param {number} [options.contextLines] Number of unchanged context lines around each change.
	 * @returns {{identical: boolean, lines: Array<{type: string, text: string}>}}
	 */
	computeFileDiff(accountContent, localContent, options = {}) {
		const accountLabel = options.accountLabel || 'account';
		const localLabel = options.localLabel || 'local';
		const contextLines = Number.isInteger(options.contextLines) ? options.contextLines : DEFAULT_CONTEXT_LINES;

		if (accountContent === localContent) {
			return { identical: true, lines: [] };
		}

		const patch = Diff.structuredPatch(accountLabel, localLabel, accountContent, localContent, '', '', { context: contextLines });

		const lines = [
			{ type: DIFF_LINE_TYPE.HEADER, text: `--- ${accountLabel}` },
			{ type: DIFF_LINE_TYPE.HEADER, text: `+++ ${localLabel}` },
		];

		patch.hunks.forEach((hunk) => {
			lines.push({
				type: DIFF_LINE_TYPE.HUNK,
				text: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
			});
			hunk.lines.forEach((line) => {
				lines.push({ type: this._classifyLine(line), text: line });
			});
		});

		return { identical: false, lines };
	}

	/**
	 * Renders the structured diff lines into a single printable string, optionally colorized with ANSI codes.
	 * @param {Array<{type: string, text: string}>} lines Output of computeFileDiff().lines.
	 * @param {boolean} useColor Whether to wrap the lines in ANSI color codes.
	 * @returns {string}
	 */
	renderDiff(lines, useColor) {
		return lines
			.map((line) => {
				if (!useColor) {
					return line.text;
				}
				switch (line.type) {
					case DIFF_LINE_TYPE.ADDED:
						return ANSI.GREEN + line.text + ANSI.RESET;
					case DIFF_LINE_TYPE.REMOVED:
						return ANSI.RED + line.text + ANSI.RESET;
					case DIFF_LINE_TYPE.HEADER:
					case DIFF_LINE_TYPE.HUNK:
						return ANSI.CYAN + line.text + ANSI.RESET;
					default:
						return line.text;
				}
			})
			.join('\n');
	}

	_classifyLine(line) {
		const marker = line.charAt(0);
		if (marker === '+') {
			return DIFF_LINE_TYPE.ADDED;
		}
		if (marker === '-') {
			return DIFF_LINE_TYPE.REMOVED;
		}
		// ' ' (context) and '\' ("\ No newline at end of file") are shown without emphasis.
		return DIFF_LINE_TYPE.CONTEXT;
	}
}

module.exports = new FileDifferenceUtils();
module.exports.DIFF_LINE_TYPE = DIFF_LINE_TYPE;
