/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function isDirectExecution(moduleUrl) {
	if (!process.argv[1]) return false;
	try {
		const [modulePath, entryPath] = await Promise.all([
			realpath(fileURLToPath(moduleUrl)),
			realpath(process.argv[1]),
		]);
		return modulePath === entryPath;
	} catch {
		return false;
	}
}
