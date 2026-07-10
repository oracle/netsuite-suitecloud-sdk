/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const UNZIP_BINARY_NAME = 'unzip';

export function extractZipArchive(zipFilePath: string, destinationFolder: string): Promise<unknown> {
	return execFileAsync(UNZIP_BINARY_NAME, ['-o', zipFilePath, '-d', destinationFolder]);
}
