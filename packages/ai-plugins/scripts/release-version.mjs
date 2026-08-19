/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RELEASE_VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const MANIFEST_PATHS = [
	path.join('.claude-plugin', 'plugin.json'),
	path.join('.codex-plugin', 'plugin.json'),
];

/**
 * Parses a canonical, stable SemVer release version. Prerelease and build
 * metadata are intentionally unsupported for published plug-ins.
 */
export function parseReleaseVersion(version) {
	if (typeof version !== 'string') {
		throw new Error('Release version must be a string in MAJOR.MINOR.PATCH format');
	}

	const match = RELEASE_VERSION_PATTERN.exec(version);
	if (!match) {
		throw new Error(`Invalid release version "${version}": expected canonical MAJOR.MINOR.PATCH`);
	}

	return match.slice(1);
}

export function isValidReleaseVersion(version) {
	try {
		parseReleaseVersion(version);
		return true;
	} catch {
		return false;
	}
}

function compareComponent(left, right) {
	if (left.length !== right.length) {
		return left.length > right.length ? 1 : -1;
	}
	if (left === right) {
		return 0;
	}
	return left > right ? 1 : -1;
}

/** Compares validated release versions without converting components to Number. */
export function compareReleaseVersions(left, right) {
	const leftParts = parseReleaseVersion(left);
	const rightParts = parseReleaseVersion(right);

	for (let index = 0; index < leftParts.length; index += 1) {
		const comparison = compareComponent(leftParts[index], rightParts[index]);
		if (comparison !== 0) {
			return comparison;
		}
	}
	return 0;
}

async function readManifestVersion(pluginDirectory) {
	const manifestPaths = [];
	for (const relativePath of MANIFEST_PATHS) {
		const manifestPath = path.join(pluginDirectory, relativePath);
		if (await fs.access(manifestPath).then(() => true).catch(() => false)) {
			manifestPaths.push(manifestPath);
		}
	}

	if (manifestPaths.length !== 1) {
		throw new Error(`Expected exactly one generated plug-in manifest in ${pluginDirectory}`);
	}

	let manifest;
	try {
		manifest = JSON.parse(await fs.readFile(manifestPaths[0], 'utf8'));
	} catch (error) {
		throw new Error(`Unable to read generated plug-in manifest ${manifestPaths[0]}: ${error.message}`);
	}

	parseReleaseVersion(manifest.version);
	return manifest.version;
}

/**
 * Validates a changed generated plug-in and enforces a strictly higher version
 * when a previously published directory is supplied. A missing previous
 * directory represents first publication. Same-version republishing is an
 * explicit exception for an already deleted release tag.
 */
export async function verifyReleaseVersion(currentDirectory, previousDirectory, { allowSameVersionRepublish = false } = {}) {
	const currentVersion = await readManifestVersion(currentDirectory);
	if (!previousDirectory || !await fs.access(previousDirectory).then(() => true).catch(() => false)) {
		return currentVersion;
	}

	const previousVersion = await readManifestVersion(previousDirectory);
	const comparison = compareReleaseVersions(currentVersion, previousVersion);
	if (comparison < 0 || (comparison === 0 && !allowSameVersionRepublish)) {
		throw new Error(`Changed plug-in content requires a higher version: ${previousVersion} -> ${currentVersion}`);
	}
	return currentVersion;
}

async function main() {
	const args = process.argv.slice(2);
	const allowSameVersionRepublish = args[0] === '--allow-same-version-republish';
	if (allowSameVersionRepublish) {
		args.shift();
	}
	const [currentDirectory, previousDirectory] = args;
	if (!currentDirectory || args.length > 2) {
		throw new Error('Usage: node release-version.mjs [--allow-same-version-republish] <current-plugin-directory> [previous-plugin-directory]');
	}
	process.stdout.write(`${await verifyReleaseVersion(currentDirectory, previousDirectory, { allowSameVersionRepublish })}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	await main();
}
