/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as path from 'path';
import { constants as fsConstants } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { UTILS } from '../services/translation/TranslationKeys';
import { translationService } from '../services/translation/TranslationService';

export interface Zipper {
	zipEntries(sourceDirectory: string, destinationFile: string, entries: readonly EntryToZipSource[]): Promise<string>;

	unzip(archiveFile: string, destinationDirectory: string, options?: UnzipOptions): Promise<void>;
}

export interface UnzipOptions {
	maxEntries?: number;
	maxTotalUncompressedSize?: number;
	maxEntryUncompressedSize?: number;
	maxEntryNameLength?: number;
}

export interface EntryToZipSource {
	path: string;
	isDirectory?: boolean;
}

export interface EntryToZip {
	sourceDirectory: string;
	relativePath: string;
	absolutePath: string;
	isDirectory: boolean;
	includeDirectoryContents?: boolean;
}

const AdmZip: new (filePath?: string) => AdmZipArchive = require('adm-zip');

const DEFAULT_UNZIP_MAX_ENTRIES = 10000;
const DEFAULT_UNZIP_MAX_TOTAL_UNCOMPRESSED_SIZE = 1024 * 1024 * 1024;
const DEFAULT_UNZIP_MAX_ENTRY_UNCOMPRESSED_SIZE = DEFAULT_UNZIP_MAX_TOTAL_UNCOMPRESSED_SIZE;
const DEFAULT_UNZIP_MAX_ENTRY_NAME_LENGTH = 4096;

interface AdmZipEntry {
	entryName: string;
	isDirectory: boolean;
	header?: {
		attr?: number;
		size?: number;
	};

	getData(): Buffer;
}

interface AdmZipArchive {
	addFile(entryName: string, content: Buffer, comment?: string, attr?: number | fs.Stats): void;

	getEntries(): AdmZipEntry[];

	writeZipPromise(targetFileName: string): Promise<void>;
}

interface ErrorWithCodeAndPath extends Error {
	code?: string;
	path?: string;
}

interface ValidatedZipEntry {
	entry: AdmZipEntry;
	entryName: string;
	targetPath: string;
	isDirectory: boolean;
	uncompressedSize?: number;
	data?: Buffer;
}

export class ZipperImpl implements Zipper {
	zipEntries(
		sourceDirectory: string,
		destinationFile: string,
		entries: readonly EntryToZipSource[],
	): Promise<string> {
		const sourceRoot = path.resolve(sourceDirectory);
		const entriesToZip = entries.map((entry) => {
			const relativePath = getSafeZipEntryName(entry.path, { allowTrailingSlash: entry.isDirectory === true });
			const absolutePath = path.resolve(sourceRoot, ...relativePath.split('/'));
			if (!isPathWithinDirectory(absolutePath, sourceRoot)) {
				throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ARCHIVE_ENTRY_OUTSIDE_PROJECT, entry.path));
			}
			return {
				sourceDirectory: sourceRoot,
				relativePath,
				absolutePath,
				isDirectory: entry.isDirectory === true,
				includeDirectoryContents: false,
			};
		});

		return this.zip(entriesToZip, destinationFile);
	}

	async unzip(archiveFile: string, destinationDirectory: string, options: UnzipOptions = {}): Promise<void> {
		const limits = getUnzipLimits(options);
		const archive = new AdmZip(archiveFile);
		const entries = archive.getEntries();
		const entryCount = entries.length;
		if (entryCount > limits.maxEntries) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.TOO_MANY_ENTRIES, entryCount));
		}

		const validatedEntries = readValidatedZipEntryData(
			validateZipEntries(entries, destinationDirectory, limits),
			limits,
		);
		await mkdir(destinationDirectory, { recursive: true });
		for (const validatedEntry of validatedEntries) {
			if (validatedEntry.isDirectory) {
				await mkdir(validatedEntry.targetPath, { recursive: true });
			} else {
				await mkdir(path.dirname(validatedEntry.targetPath), { recursive: true });
				await writeFile(validatedEntry.targetPath, validatedEntry.data as Buffer);
			}
		}
	}

	private async zip(entriesToZip: EntryToZip[], destinationFile: string): Promise<string> {
		const finalDestinationFile = path.normalize(destinationFile);
		const archive = new AdmZip();

		for (const entry of entriesToZip) {
			try {
				this.addEntryToZip(archive, entry);
			} catch (error: unknown) {
				const fileSystemError = error as ErrorWithCodeAndPath;
				// don't add the file/folder if we cannot read it.
				// should we show a warning about a missing file/folder reference
				// if error.code = ENOENT: no such file or directory
				// don't reject, just skip the file/directory
				if (fileSystemError.code !== 'ENOENT') {
					if (fileSystemError.code === 'EPERM' && fileSystemError.path) {
						// EPERM: operation not permitted
						// reject referencing the file/directory that couldn't be accessed
						throw Error(translationService.getMessage(UTILS.ZIPPER.ERROR.READ_CONTENT_FAILED, fileSystemError.path, errorToMessage(error)));
					}

					throw error;
				}
			}
		}

		await mkdir(path.dirname(finalDestinationFile), { recursive: true });
		await archive.writeZipPromise(finalDestinationFile);
		return finalDestinationFile;
	}

	private addEntryToZip(archive: AdmZipArchive, entry: EntryToZip): void {
		const entryStats = fs.lstatSync(entry.absolutePath);
		if (entryStats.isFile()) {
			archive.addFile(toZipPath(entry.relativePath), fs.readFileSync(entry.absolutePath), '', entryStats);
		}
		if (entryStats.isDirectory()) {
			if (entry.includeDirectoryContents === false) {
				this.addDirectoryToZip(archive, entry.absolutePath, entry.relativePath);
			} else {
				this.addDirectoryContentsToZip(archive, entry.absolutePath, entry.relativePath);
			}
		}
	}

	private addDirectoryToZip(archive: AdmZipArchive, absoluteDirectoryPath: string, relativeDirectoryPath: string): void {
		const entryName = `${toZipPath(relativeDirectoryPath).replace(/\/$/, '')}/`;
		archive.addFile(entryName, Buffer.alloc(0), '', fs.lstatSync(absoluteDirectoryPath));
	}

	private addDirectoryContentsToZip(
		archive: AdmZipArchive,
		absoluteDirectoryPath: string,
		relativeDirectoryPath: string,
	): void {
		this.addDirectoryToZip(archive, absoluteDirectoryPath, relativeDirectoryPath);
		const directoryEntries = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true });
		for (const directoryEntry of directoryEntries) {
			const childAbsolutePath = path.join(absoluteDirectoryPath, directoryEntry.name);
			const childRelativePath = toZipPath(path.join(relativeDirectoryPath, directoryEntry.name));
			if (directoryEntry.isFile()) {
				archive.addFile(childRelativePath, fs.readFileSync(childAbsolutePath), '', fs.lstatSync(childAbsolutePath));
			} else if (directoryEntry.isDirectory()) {
				this.addDirectoryContentsToZip(archive, childAbsolutePath, childRelativePath);
			}
		}
	}
}

function validateZipEntries(
	entries: AdmZipEntry[],
	destinationDirectory: string,
	limits: Required<UnzipOptions>,
): ValidatedZipEntry[] {
	let totalUncompressedSize = 0;
	return entries.map((entry) => {
		const entryName = getSafeZipEntryName(entry.entryName.replace(/\\/g, '/'), { allowTrailingSlash: true });
		if (Buffer.byteLength(entryName, 'utf8') > limits.maxEntryNameLength) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ENTRY_PATH_TOO_LONG));
		}
		const unixMode = getEntryUnixMode(entry);
		if ((unixMode & 0o170000) === fsConstants.S_IFLNK) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.SYMBOLIC_LINK_NOT_SUPPORTED, entryName));
		}

		const isDirectory = entry.isDirectory;
		const uncompressedSize = isDirectory ? 0 : getEntryUncompressedSize(entry);
		if (uncompressedSize !== undefined && uncompressedSize > limits.maxEntryUncompressedSize) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ENTRY_UNCOMPRESSED_SIZE_EXCEEDED, entryName));
		}
		if (uncompressedSize !== undefined) {
			totalUncompressedSize += uncompressedSize;
			if (totalUncompressedSize > limits.maxTotalUncompressedSize) {
				throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ARCHIVE_UNCOMPRESSED_SIZE_EXCEEDED));
			}
		}

		return {
			entry,
			entryName,
			targetPath: getSafeTargetPath(destinationDirectory, entryName),
			isDirectory,
			uncompressedSize,
		};
	});
}

function readValidatedZipEntryData(
	validatedEntries: ValidatedZipEntry[],
	limits: Required<UnzipOptions>,
): ValidatedZipEntry[] {
	let totalUncompressedSize = 0;
	return validatedEntries.map((validatedEntry) => {
		if (validatedEntry.isDirectory) {
			return validatedEntry;
		}

		const data = getEntryData(validatedEntry.entry);
		if (data.length > limits.maxEntryUncompressedSize) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ENTRY_UNCOMPRESSED_SIZE_EXCEEDED, validatedEntry.entryName));
		}
		if (validatedEntry.uncompressedSize !== undefined && data.length !== validatedEntry.uncompressedSize) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ENTRY_UNCOMPRESSED_SIZE_METADATA_MISMATCH, validatedEntry.entryName));
		}
		totalUncompressedSize += data.length;
		if (totalUncompressedSize > limits.maxTotalUncompressedSize) {
			throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.ARCHIVE_UNCOMPRESSED_SIZE_EXCEEDED));
		}

		return {
			...validatedEntry,
			data,
		};
	});
}

function getEntryUnixMode(entry: AdmZipEntry): number {
	const externalAttributes = entry.header?.attr;
	return Number.isSafeInteger(externalAttributes) ? (externalAttributes as number) >>> 16 : 0;
}

function getEntryUncompressedSize(entry: AdmZipEntry): number | undefined {
	const uncompressedSize = entry.header?.size;
	if (uncompressedSize === undefined || uncompressedSize === null) {
		return undefined;
	}
	if (!Number.isSafeInteger(uncompressedSize) || uncompressedSize < 0) {
		return undefined;
	}
	return uncompressedSize;
}

function getEntryData(entry: AdmZipEntry): Buffer {
	return entry.getData();
}

function getUnzipLimits(options: UnzipOptions): Required<UnzipOptions> {
	return {
		maxEntries: getPositiveLimit(options.maxEntries, DEFAULT_UNZIP_MAX_ENTRIES, 'maxEntries'),
		maxTotalUncompressedSize: getPositiveLimit(
			options.maxTotalUncompressedSize,
			DEFAULT_UNZIP_MAX_TOTAL_UNCOMPRESSED_SIZE,
			'maxTotalUncompressedSize',
		),
		maxEntryUncompressedSize: getPositiveLimit(
			options.maxEntryUncompressedSize,
			DEFAULT_UNZIP_MAX_ENTRY_UNCOMPRESSED_SIZE,
			'maxEntryUncompressedSize',
		),
		maxEntryNameLength: getPositiveLimit(
			options.maxEntryNameLength,
			DEFAULT_UNZIP_MAX_ENTRY_NAME_LENGTH,
			'maxEntryNameLength',
		),
	};
}

function getPositiveLimit(value: number | undefined, defaultValue: number, name: string): number {
	if (value === undefined) {
		return defaultValue;
	}
	if (!Number.isSafeInteger(value) || value <= 0) {
		throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.INVALID_EXTRACTION_LIMIT, name));
	}
	return value;
}

function getSafeTargetPath(destinationDirectory: string, entryName: string): string {
	const safeEntryName = getSafeZipEntryName(entryName, { allowTrailingSlash: true });
	const parts = safeEntryName.split('/');
	const destinationRoot = path.resolve(destinationDirectory);
	const targetPath = path.resolve(destinationRoot, ...parts.filter((part) => part !== ''));
	if (targetPath !== destinationRoot && !targetPath.startsWith(`${destinationRoot}${path.sep}`)) {
		throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.INVALID_ENTRY_PATH, entryName));
	}
	return targetPath;
}

/**
 * Converts Windows separators to ZIP separators: \\ to /
 * Removes one leading ./ i.e. ./manifest.xml to manifest.xml
 * If allowTrailingSlash is true, it removes all trailing slashes. FileCabinet/SuiteScripts/// to FileCabinet/SuiteScripts
 * If allowTrailingSlash is false removes only 1 trailing slash
 * Rejects empty, NUL, absolute, and Windows drive paths. ZIP entries must be relative paths. Absolute paths would be dangerous during extraction.
 * @param entryName
 * @param options
 */
function getSafeZipEntryName(entryName: string, options: { allowTrailingSlash?: boolean } = {}): string {
	const normalizedEntryName = entryName.replace(/\\/g, '/').replace(/^\.\//, '');
	const safeEntryName = options.allowTrailingSlash
		? normalizedEntryName.replace(/\/+$/, '')
		: normalizedEntryName.replace(/\/$/, '');
	if (!safeEntryName || safeEntryName.includes('\0') || safeEntryName.startsWith('/') || /^[A-Za-z]:\//.test(safeEntryName)) {
		throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.INVALID_ENTRY_PATH, entryName));
	}
	const parts = safeEntryName.split('/');
	if (parts.some((part) => !part || part === '.' || part === '..')) {
		throw new Error(translationService.getMessage(UTILS.ZIPPER.ERROR.INVALID_ENTRY_PATH, entryName));
	}
	return safeEntryName;
}

function isPathWithinDirectory(targetPath: string, directoryPath: string): boolean {
	const resolvedTargetPath = normalizePathForComparison(path.resolve(targetPath));
	const resolvedDirectoryPath = normalizePathForComparison(path.resolve(directoryPath));
	return resolvedTargetPath === resolvedDirectoryPath || resolvedTargetPath.startsWith(`${resolvedDirectoryPath}${path.sep}`);
}

function toZipPath(filepath: string): string {
	return filepath.replace(/\\/g, '/');
}

function normalizePathForComparison(filepath: string): string {
	return process.platform === 'win32' ? filepath.toLowerCase() : filepath;
}

function errorToMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
