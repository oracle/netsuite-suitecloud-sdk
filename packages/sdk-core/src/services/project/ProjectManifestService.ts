/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseStringPromise } from 'xml2js';

const MANIFEST_FILE = 'manifest.xml';

export async function isSuiteAppProject(projectFolder: string): Promise<boolean> {
	const manifestContents = await readManifest(projectFolder);
	return !!manifestContents && /projecttype\s*=\s*"SUITEAPP"/i.test(manifestContents);
}

export async function getPackageRoot(projectFolder: string): Promise<string> {
	const manifestContents = await readManifest(projectFolder);
	if (!manifestContents) {
		return '';
	}
	try {
		const manifest = await parseStringPromise(manifestContents, { explicitArray: false, trim: true });
		const manifestNode = manifest?.manifest;
		const publisherId = asString(manifestNode?.publisherid) ?? asString(manifestNode?.publisherId);
		const projectId = asString(manifestNode?.projectid) ?? asString(manifestNode?.projectId);
		return publisherId ? (projectId ? `${publisherId}.${projectId}` : publisherId) : '';
	} catch {
		return '';
	}
}

async function readManifest(projectFolder: string): Promise<string | undefined> {
	try {
		return await readFile(join(projectFolder, MANIFEST_FILE), 'utf8');
	} catch {
		return undefined;
	}
}

function asString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}
