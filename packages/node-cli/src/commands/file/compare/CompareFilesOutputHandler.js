/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const {
	COMMAND_COMPAREFILES: { OUTPUT, MESSAGES },
} = require('../../../services/TranslationKeys');

module.exports = class CompareFilesOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (actionResult.data) {
			const { filePath, diffData, hasDifferences, fileNotFound } = actionResult.data;

			// Check if file was not found in account
			if (fileNotFound) {
				this._log.warning(NodeTranslationService.getMessage(OUTPUT.FILE_NOT_FOUND, filePath));
				return actionResult;
			}

			this._log.result(NodeTranslationService.getMessage(OUTPUT.COMPARING_FILE, filePath));
			this._log.result('');

			if (!hasDifferences) {
				this._log.result(NodeTranslationService.getMessage(OUTPUT.FILES_IDENTICAL));
			} else {
				this._log.result(NodeTranslationService.getMessage(OUTPUT.DIFFERENCES_FOUND));
				this._log.result('');
				
				// Print side-by-side diff header
				this._printSideBySideHeader();
				
				// Print diff lines
				this._printSideBySideDiff(diffData.lines);

				this._log.result('');
				this._log.result(NodeTranslationService.getMessage(OUTPUT.DIFF_SUMMARY, 
					diffData.changesAdded,
					diffData.changesRemoved
				));
			}
		}

		return actionResult;
	}

	_printSideBySideHeader() {
		const accountHeader = 'Account'.padEnd(50);
		const localHeader = 'Local';
		this._log.result(`      | ${accountHeader} | ${localHeader}`);
		this._log.result('------+' + '-'.repeat(52) + '+' + '-'.repeat(52));
	}

	_printSideBySideDiff(lines) {
		const terminalWidth = process.stdout.columns || 120;
		const halfWidth = Math.floor((terminalWidth - 10) / 2);
		
		lines.forEach((line) => {
			const { accountLineNum, accountContent, localLineNum, localContent, status, marker } = line;
			
			// Format line numbers
			const accNum = accountLineNum.toString().padStart(4).slice(0, 4);
			const locNum = localLineNum.toString().padStart(4).slice(0, 4);
			
			// Truncate and pad content to fit half width
			let accContent = this._truncateString(accountContent, halfWidth);
			let locContent = this._truncateString(localContent, halfWidth);
			
			accContent = accContent.padEnd(halfWidth);
			locContent = locContent.padEnd(halfWidth);
			
			// Add status indicators
			if (status === 'added') {
				// Line only in local (added)
				this._log.result(`${accNum}  | ${' '.repeat(halfWidth)} | ${locNum} > ${locContent}`);
			} else if (status === 'removed') {
				// Line only in account (removed)
				this._log.result(`${accNum} < | ${accContent} | ${' '.repeat(halfWidth)}`);
			} else {
				// Unchanged
				this._log.result(`${accNum}   | ${accContent} | ${locNum}   ${locContent}`);
			}
		});
	}

	_truncateString(str, maxLength) {
		if (!str) return '';
		if (str.length <= maxLength) return str;
		return str.substring(0, maxLength - 3) + '...';
	}

	parseError(actionResult) {
		if (actionResult.errorMessages && actionResult.errorMessages.length > 0) {
			this._log.error(NodeTranslationService.getMessage(OUTPUT.COMPARE_ERROR));
			actionResult.errorMessages.forEach((error) => {
				this._log.error(error);
			});
		}
		return actionResult;
	}
};
