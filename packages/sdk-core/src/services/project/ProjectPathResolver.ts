/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { realpath } from 'node:fs/promises';
import { dirname, isAbsolute, posix, relative, resolve, sep } from 'node:path';

const PATH_OUTSIDE_ROOT_ERROR_CODE = 'PATH_OUTSIDE_ROOT';

export class PathOutsideRootError extends Error {
	readonly code = PATH_OUTSIDE_ROOT_ERROR_CODE;

	constructor(readonly candidatePath: string) {
		super(PATH_OUTSIDE_ROOT_ERROR_CODE);
		this.name = 'PathOutsideRootError';
	}
}

/** Resolves a SuiteCloud path such as /SuiteScripts/file.js below a local root folder. */
export function resolveSuiteCloudPath(rootFolder: string, suiteCloudPath: string): string {
	const normalizedPath = normalizeSuiteCloudPath(suiteCloudPath);
	if (hasParentTraversal(normalizedPath)) {
		throw new PathOutsideRootError(suiteCloudPath);
	}

	const projectRelativePath = normalizedPath.replace(/^\/+/, '');
	return assertPathWithin(rootFolder, resolve(rootFolder, projectRelativePath));
}

/** Returns whether a SuiteCloud path is the supplied virtual root or one of its descendants. */
export function isSuiteCloudPathWithinRoot(suiteCloudPath: string, virtualRoot: string): boolean {
	const normalizedPath = normalizeSuiteCloudPath(suiteCloudPath);
	const normalizedRoot = normalizeSuiteCloudPath(virtualRoot);
	if (hasParentTraversal(normalizedPath)) {
		return false;
	}

	const relativePath = posix.relative(normalizedRoot, normalizedPath);
	return isContainedRelativePath(relativePath, posix.sep, posix.isAbsolute);
}

/** Verifies lexical containment for a local operating-system path. */
export function assertPathWithin(rootFolder: string, candidatePath: string): string {
	const resolvedRoot = resolve(rootFolder);
	const resolvedCandidate = resolve(candidatePath);
	const relativePath = relative(resolvedRoot, resolvedCandidate);

	if (!isContainedRelativePath(relativePath, sep, isAbsolute)) {
		throw new PathOutsideRootError(candidatePath);
	}
	return resolvedCandidate;
}

/** Verifies containment after resolving symlinks for an existing path. */
export async function assertRealPathWithin(rootFolder: string, candidatePath: string): Promise<string> {
	const [realRoot, realCandidate] = await Promise.all([realpath(rootFolder), realpath(candidatePath)]);
	return assertPathWithin(realRoot, realCandidate);
}

/**
 * Verifies a path that may not exist yet by resolving its nearest existing ancestor.
 * This prevents a lexically valid destination from escaping through an existing symlink.
 */
export async function assertCreatablePathWithin(rootFolder: string, candidatePath: string): Promise<string> {
	const resolvedCandidate = assertPathWithin(rootFolder, candidatePath);
	const [realRoot, realAncestor] = await Promise.all([
		realpath(rootFolder),
		resolveNearestExistingAncestor(resolvedCandidate),
	]);
	assertPathWithin(realRoot, realAncestor);
	return resolvedCandidate;
}

function normalizeSuiteCloudPath(value: string): string {
	return String(value ?? '').trim().replace(/\\/g, '/');
}

function hasParentTraversal(value: string): boolean {
	return value.split('/').includes('..');
}

function isContainedRelativePath(
	relativePath: string,
	pathSeparator: string,
	isAbsolutePath: (value: string) => boolean
): boolean {
	return (
		relativePath === '' ||
		(relativePath !== '..' && !relativePath.startsWith(`..${pathSeparator}`) && !isAbsolutePath(relativePath))
	);
}

async function resolveNearestExistingAncestor(candidatePath: string): Promise<string> {
	let currentPath = candidatePath;
	while (true) {
		try {
			return await realpath(currentPath);
		} catch (error: unknown) {
			if (!isMissingPathError(error)) {
				throw error;
			}
			const parentPath = dirname(currentPath);
			if (parentPath === currentPath) {
				throw error;
			}
			currentPath = parentPath;
		}
	}
}

function isMissingPathError(error: unknown): boolean {
	return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
}
