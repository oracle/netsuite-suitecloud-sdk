/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { readFileSync, readdirSync } = require('node:fs');
const { join, relative } = require('node:path');

const sdkCoreSource = join(__dirname, '..', '..', '..', 'sdk-core', 'src');
const userFacingLiteralPatterns = [
	/new Error\(\s*(['`])[^'`]+\1/g,
	/errorResultWithMessage\(\s*(['`])[^'`]+\1/g,
	/(?:data|errorMessage|message|resultMessage|timeoutMessage):\s*(['`])[^'`]+\1/g,
	/\?\?\s*(['`])[^'`]+\1/g,
];

describe('sdk-core user-facing messages', () => {
	it('does not define user-facing messages inline', () => {
		const violations = listTypeScriptFiles(sdkCoreSource).flatMap((filePath) => {
			const source = readFileSync(filePath, 'utf8');
			return userFacingLiteralPatterns.flatMap((pattern) =>
				Array.from(source.matchAll(pattern), (match) => ({
					file: relative(sdkCoreSource, filePath),
					literal: match[0],
				}))
			);
		});

		expect(violations).toEqual([]);
	});
});

function listTypeScriptFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			return listTypeScriptFiles(entryPath);
		}
		return entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') ? [entryPath] : [];
	});
}
