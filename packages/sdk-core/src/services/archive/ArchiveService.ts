/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	ZipperImpl,
	type EntryToZipSource,
	type UnzipOptions,
} from '../../utils/Zipper';

const zipper = new ZipperImpl();

export function createZipArchive(
	sourceDirectory: string,
	destinationFile: string,
	entries: readonly EntryToZipSource[]
): Promise<string> {
	return zipper.zipEntries(sourceDirectory, destinationFile, entries);
}

export function extractZipArchive(
	archiveFile: string,
	destinationDirectory: string,
	options?: UnzipOptions
): Promise<void> {
	return zipper.unzip(archiveFile, destinationDirectory, options);
}
