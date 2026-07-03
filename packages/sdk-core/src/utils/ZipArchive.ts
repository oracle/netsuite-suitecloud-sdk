/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { constants as fsConstants } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { deflateRaw, inflateRaw } from 'node:zlib';
import { promisify } from 'node:util';

const deflateRawAsync = promisify(deflateRaw);
const inflateRawAsync = promisify(inflateRaw);

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const UTF8_FLAG = 0x0800;
const ENCRYPTED_FLAG = 0x0001;
const STORE_METHOD = 0;
const DEFLATE_METHOD = 8;
const MAX_UINT16 = 0xffff;
const MAX_UINT32 = 0xffffffff;
const END_OF_CENTRAL_DIRECTORY_SIZE = 22;
const MAX_END_OF_CENTRAL_DIRECTORY_SEARCH = END_OF_CENTRAL_DIRECTORY_SIZE + MAX_UINT16;

type ZipEntry = {
	name: string;
	compressedData: Buffer;
	uncompressedSize: number;
	crc: number;
	modifiedAt: Date;
	localHeaderOffset: number;
	isDirectory: boolean;
};

export type ZipArchiveEntrySource = {
	path: string;
	isDirectory?: boolean;
};

export async function createZipArchive(
	sourceFolder: string,
	destinationFile: string,
	excludedPaths: readonly string[] = []
): Promise<void> {
	const entries = await collectFiles(sourceFolder, excludedPaths);
	await writeZipArchive(destinationFile, entries);
}

async function writeZipArchive(destinationFile: string, entries: ZipEntry[]): Promise<void> {
	const localParts: Buffer[] = [];
	const centralParts: Buffer[] = [];
	let offset = 0;

	for (const entry of entries) {
		entry.localHeaderOffset = offset;
		const name = Buffer.from(entry.name, 'utf8');
		ensureZip32Value(name.length, 'entry name');
		ensureZip32Value(entry.uncompressedSize, 'file');
		ensureZip32Value(entry.compressedData.length, 'compressed file');

		const { date, time } = toDosDateTime(entry.modifiedAt);
		const compressionMethod = entry.isDirectory ? STORE_METHOD : DEFLATE_METHOD;
		const localHeader = Buffer.alloc(30);
		localHeader.writeUInt32LE(LOCAL_FILE_HEADER_SIGNATURE, 0);
		localHeader.writeUInt16LE(20, 4);
		localHeader.writeUInt16LE(UTF8_FLAG, 6);
		localHeader.writeUInt16LE(compressionMethod, 8);
		localHeader.writeUInt16LE(time, 10);
		localHeader.writeUInt16LE(date, 12);
		localHeader.writeUInt32LE(entry.crc, 14);
		localHeader.writeUInt32LE(entry.compressedData.length, 18);
		localHeader.writeUInt32LE(entry.uncompressedSize, 22);
		localHeader.writeUInt16LE(name.length, 26);

		localParts.push(localHeader, name, entry.compressedData);
		offset += localHeader.length + name.length + entry.compressedData.length;

		const centralHeader = Buffer.alloc(46);
		centralHeader.writeUInt32LE(CENTRAL_DIRECTORY_HEADER_SIGNATURE, 0);
		centralHeader.writeUInt16LE(0x031e, 4);
		centralHeader.writeUInt16LE(20, 6);
		centralHeader.writeUInt16LE(UTF8_FLAG, 8);
		centralHeader.writeUInt16LE(compressionMethod, 10);
		centralHeader.writeUInt16LE(time, 12);
		centralHeader.writeUInt16LE(date, 14);
		centralHeader.writeUInt32LE(entry.crc, 16);
		centralHeader.writeUInt32LE(entry.compressedData.length, 20);
		centralHeader.writeUInt32LE(entry.uncompressedSize, 24);
		centralHeader.writeUInt16LE(name.length, 28);
		centralHeader.writeUInt32LE(((entry.isDirectory ? 0o040755 : 0o100644) << 16) >>> 0, 38);
		centralHeader.writeUInt32LE(entry.localHeaderOffset, 42);
		centralParts.push(centralHeader, name);
	}

	const centralDirectory = Buffer.concat(centralParts);
	ensureZip32Value(entries.length, 'entry count', MAX_UINT16);
	ensureZip32Value(offset, 'archive offset');
	ensureZip32Value(centralDirectory.length, 'central directory');

	const endRecord = Buffer.alloc(END_OF_CENTRAL_DIRECTORY_SIZE);
	endRecord.writeUInt32LE(END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
	endRecord.writeUInt16LE(entries.length, 8);
	endRecord.writeUInt16LE(entries.length, 10);
	endRecord.writeUInt32LE(centralDirectory.length, 12);
	endRecord.writeUInt32LE(offset, 16);

	await mkdir(dirname(destinationFile), { recursive: true });
	await writeFile(destinationFile, Buffer.concat([...localParts, centralDirectory, endRecord]));
}

export async function createZipArchiveFromEntries(
	sourceFolder: string,
	destinationFile: string,
	entrySources: readonly ZipArchiveEntrySource[]
): Promise<void> {
	const entries = await collectIncludedEntries(sourceFolder, entrySources);
	await writeZipArchive(destinationFile, entries);
}

export async function extractZipArchive(archiveFile: string, destinationFolder: string): Promise<void> {
	const archive = await readFile(archiveFile);
	const endOffset = findEndOfCentralDirectory(archive);
	const entryCount = archive.readUInt16LE(endOffset + 10);
	const centralDirectorySize = archive.readUInt32LE(endOffset + 12);
	const centralDirectoryOffset = archive.readUInt32LE(endOffset + 16);
	assertBufferRange(archive, centralDirectoryOffset, centralDirectorySize, 'central directory');

	await mkdir(destinationFolder, { recursive: true });
	let offset = centralDirectoryOffset;
	for (let index = 0; index < entryCount; index++) {
		assertBufferRange(archive, offset, 46, 'central directory entry');
		if (archive.readUInt32LE(offset) !== CENTRAL_DIRECTORY_HEADER_SIGNATURE) {
			throw new Error('Invalid ZIP central directory entry.');
		}

		const flags = archive.readUInt16LE(offset + 8);
		const method = archive.readUInt16LE(offset + 10);
		const expectedCrc = archive.readUInt32LE(offset + 16);
		const compressedSize = archive.readUInt32LE(offset + 20);
		const uncompressedSize = archive.readUInt32LE(offset + 24);
		const nameLength = archive.readUInt16LE(offset + 28);
		const extraLength = archive.readUInt16LE(offset + 30);
		const commentLength = archive.readUInt16LE(offset + 32);
		const externalAttributes = archive.readUInt32LE(offset + 38);
		const localHeaderOffset = archive.readUInt32LE(offset + 42);
		const centralEntrySize = 46 + nameLength + extraLength + commentLength;
		assertBufferRange(archive, offset, centralEntrySize, 'central directory entry');

		if (flags & ENCRYPTED_FLAG) {
			throw new Error('Encrypted ZIP entries are not supported.');
		}
		if (method !== STORE_METHOD && method !== DEFLATE_METHOD) {
			throw new Error(`ZIP compression method ${method} is not supported.`);
		}

		const rawName = archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
		const entryName = rawName.replace(/\\/g, '/');
		const isDirectory = entryName.endsWith('/');
		const unixMode = externalAttributes >>> 16;
		if ((unixMode & 0o170000) === fsConstants.S_IFLNK) {
			throw new Error(`ZIP symbolic link entries are not supported: "${entryName}".`);
		}

		const targetPath = getSafeTargetPath(destinationFolder, entryName);
		if (isDirectory) {
			await mkdir(targetPath, { recursive: true });
		} else {
			const compressedData = getCompressedData(archive, localHeaderOffset, compressedSize);
			const data =
				method === STORE_METHOD
					? Buffer.from(compressedData)
					: await inflateRawAsync(compressedData, { maxOutputLength: Math.max(1, uncompressedSize) });
			if (data.length !== uncompressedSize || crc32(data) !== expectedCrc) {
				throw new Error(`Invalid ZIP entry data: "${entryName}".`);
			}
			await mkdir(dirname(targetPath), { recursive: true });
			await writeFile(targetPath, data);
		}

		offset += centralEntrySize;
	}
}

async function collectFiles(sourceFolder: string, excludedPaths: readonly string[]): Promise<ZipEntry[]> {
	const entries: ZipEntry[] = [];
	const exclusions = excludedPaths.map((path) => path.replace(/\\/g, '/').replace(/\/\*$/, ''));

	async function visit(folder: string): Promise<void> {
		const directoryEntries = await readdir(folder, { withFileTypes: true });
		directoryEntries.sort((left, right) => left.name.localeCompare(right.name));
		for (const directoryEntry of directoryEntries) {
			const fullPath = resolve(folder, directoryEntry.name);
			const entryName = relative(sourceFolder, fullPath).split(sep).join('/');
			if (isExcluded(entryName, exclusions)) {
				continue;
			}
			if (directoryEntry.isDirectory()) {
				await visit(fullPath);
			} else if (directoryEntry.isFile()) {
				const [data, fileStat] = await Promise.all([readFile(fullPath), stat(fullPath)]);
				entries.push({
					name: entryName,
					compressedData: await deflateRawAsync(data),
					uncompressedSize: data.length,
					crc: crc32(data),
					modifiedAt: fileStat.mtime,
					localHeaderOffset: 0,
					isDirectory: false,
				});
			} else {
				throw new Error(`Unsupported project entry type: "${entryName}".`);
			}
		}
	}

	await visit(sourceFolder);
	return entries;
}

async function collectIncludedEntries(
	sourceFolder: string,
	entrySources: readonly ZipArchiveEntrySource[]
): Promise<ZipEntry[]> {
	const sourceRoot = resolve(sourceFolder);
	const entries: ZipEntry[] = [];
	const seen = new Set<string>();

	for (const entrySource of entrySources) {
		const normalizedPath = entrySource.path.replace(/\\/g, '/').replace(/^\.\//, '');
		const entryName = entrySource.isDirectory ? `${normalizedPath.replace(/\/$/, '')}/` : normalizedPath.replace(/\/$/, '');
		if (!entryName || seen.has(entryName)) {
			continue;
		}
		const fullPath = resolve(sourceRoot, ...entryName.replace(/\/$/, '').split('/'));
		if (fullPath !== sourceRoot && !fullPath.startsWith(`${sourceRoot}${sep}`)) {
			throw new Error(`Project archive entry is outside the project folder: "${entryName}".`);
		}

		const fileStat = await stat(fullPath);
		if (entrySource.isDirectory) {
			if (!fileStat.isDirectory()) {
				throw new Error(`Project archive directory is not a directory: "${entryName}".`);
			}
			entries.push({
				name: entryName,
				compressedData: Buffer.alloc(0),
				uncompressedSize: 0,
				crc: 0,
				modifiedAt: fileStat.mtime,
				localHeaderOffset: 0,
				isDirectory: true,
			});
		} else {
			if (!fileStat.isFile()) {
				throw new Error(`Project archive file is not a regular file: "${entryName}".`);
			}
			const data = await readFile(fullPath);
			entries.push({
				name: entryName,
				compressedData: await deflateRawAsync(data),
				uncompressedSize: data.length,
				crc: crc32(data),
				modifiedAt: fileStat.mtime,
				localHeaderOffset: 0,
				isDirectory: false,
			});
		}
		seen.add(entryName);
	}

	return entries;
}

function isExcluded(entryName: string, exclusions: readonly string[]): boolean {
	return exclusions.some((excludedPath) => entryName === excludedPath || entryName.startsWith(`${excludedPath}/`));
}

function getCompressedData(archive: Buffer, localHeaderOffset: number, compressedSize: number): Buffer {
	assertBufferRange(archive, localHeaderOffset, 30, 'local file header');
	if (archive.readUInt32LE(localHeaderOffset) !== LOCAL_FILE_HEADER_SIGNATURE) {
		throw new Error('Invalid ZIP local file header.');
	}
	const nameLength = archive.readUInt16LE(localHeaderOffset + 26);
	const extraLength = archive.readUInt16LE(localHeaderOffset + 28);
	const dataOffset = localHeaderOffset + 30 + nameLength + extraLength;
	assertBufferRange(archive, dataOffset, compressedSize, 'file data');
	return archive.subarray(dataOffset, dataOffset + compressedSize);
}

function getSafeTargetPath(destinationFolder: string, entryName: string): string {
	if (!entryName || entryName.includes('\0') || entryName.startsWith('/') || /^[A-Za-z]:\//.test(entryName)) {
		throw new Error(`Invalid ZIP entry path: "${entryName}".`);
	}
	const parts = entryName.split('/');
	if (parts.some((part) => part === '..')) {
		throw new Error(`Invalid ZIP entry path: "${entryName}".`);
	}
	const destinationRoot = resolve(destinationFolder);
	const targetPath = resolve(destinationRoot, ...parts.filter((part) => part !== '' && part !== '.'));
	if (targetPath !== destinationRoot && !targetPath.startsWith(`${destinationRoot}${sep}`)) {
		throw new Error(`Invalid ZIP entry path: "${entryName}".`);
	}
	return targetPath;
}

function findEndOfCentralDirectory(archive: Buffer): number {
	const lowerBound = Math.max(0, archive.length - MAX_END_OF_CENTRAL_DIRECTORY_SEARCH);
	for (let offset = archive.length - END_OF_CENTRAL_DIRECTORY_SIZE; offset >= lowerBound; offset--) {
		if (
			archive.readUInt32LE(offset) === END_OF_CENTRAL_DIRECTORY_SIGNATURE &&
			offset + END_OF_CENTRAL_DIRECTORY_SIZE + archive.readUInt16LE(offset + 20) === archive.length
		) {
			if (archive.readUInt16LE(offset + 4) !== 0 || archive.readUInt16LE(offset + 6) !== 0) {
				throw new Error('Multi-disk ZIP archives are not supported.');
			}
			return offset;
		}
	}
	throw new Error('Invalid ZIP archive: end of central directory not found.');
}

function assertBufferRange(buffer: Buffer, offset: number, length: number, description: string): void {
	if (offset < 0 || length < 0 || offset > buffer.length - length) {
		throw new Error(`Invalid ZIP ${description}.`);
	}
}

function ensureZip32Value(value: number, description: string, maximum = MAX_UINT32): void {
	if (value > maximum) {
		throw new Error(`ZIP64 is required for this ${description}, but ZIP64 is not supported.`);
	}
}

function toDosDateTime(date: Date): { date: number; time: number } {
	const year = Math.min(2107, Math.max(1980, date.getFullYear()));
	return {
		date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
		time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
	};
}

function crc32(data: Buffer): number {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit++) {
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}
