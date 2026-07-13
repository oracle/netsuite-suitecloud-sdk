/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	AdmZipArchive,
	type ArchiveEntry,
	type ArchiveExtractionOptions,
} from './ZipArchive';

export type { ArchiveEntry, ArchiveExtractionOptions } from './ZipArchive';

const archive = new AdmZipArchive();

export function createZipArchive(
	sourceDirectory: string,
	destinationFile: string,
	entries: readonly ArchiveEntry[]
): Promise<string> {
	return archive.zipEntries(sourceDirectory, destinationFile, entries);
}

export function extractZipArchive(
	archiveFile: string,
	destinationDirectory: string,
	options?: ArchiveExtractionOptions
): Promise<void> {
	return archive.unzip(archiveFile, destinationDirectory, options);
}
