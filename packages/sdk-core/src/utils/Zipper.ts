/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import archiver from 'archiver';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import { constants as fsConstants } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { inflateRaw } from 'node:zlib';
import { promisify } from 'node:util';

const inflateRawAsync = promisify(inflateRaw);
const CENTRAL_DIRECTORY_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ENCRYPTED_FLAG = 0x0001;
const STORE_METHOD = 0;
const DEFLATE_METHOD = 8;
const END_OF_CENTRAL_DIRECTORY_SIZE = 22;
const MAX_END_OF_CENTRAL_DIRECTORY_SEARCH = END_OF_CENTRAL_DIRECTORY_SIZE + 0xffff;
const ZIP64_ENTRY_COUNT_SENTINEL = 0xffff;
const ZIP64_OFFSET_OR_SIZE_SENTINEL = 0xffffffff;
const DEFAULT_UNZIP_MAX_ENTRIES = 10000;
const DEFAULT_UNZIP_MAX_TOTAL_UNCOMPRESSED_SIZE = 1024 * 1024 * 1024;
const DEFAULT_UNZIP_MAX_ENTRY_NAME_LENGTH = 4096;

export interface Zipper {
	zipSuiteCloudProject(sourceDirectory: string, destinationFile: string): Promise<string>;
	zipEntries(sourceDirectory: string, destinationFile: string, entries: readonly EntryToZipSource[]): Promise<string>;
	unzip(archiveFile: string, destinationDirectory: string, options?: UnzipOptions): Promise<void>;
}

export interface UnzipOptions {
	maxEntries?: number;
	maxTotalUncompressedSize?: number;
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


export class ZipperImpl implements Zipper {

	async zipSuiteCloudProject(sourceDirectory: string, destinationFile: string): Promise<string> {
		// basic validation here? Check that its a valid project: existence of deploy.xml, manifest.xml in sourceDirectory
		const entriesToZip = this.getEntriesToZip(sourceDirectory);
		return this.zip(entriesToZip, destinationFile);
	}

	async zipEntries(
		sourceDirectory: string,
		destinationFile: string,
		entries: readonly EntryToZipSource[]
	): Promise<string> {
		const sourceRoot = path.resolve(sourceDirectory);
		const entriesToZip = entries.map((entry) => {
			const relativePath = entry.path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, '');
			if (!relativePath) {
				throw new Error('Project archive entries must have a path.');
			}
			const absolutePath = path.resolve(sourceRoot, ...relativePath.split('/'));
			if (!isPathWithinDirectory(absolutePath, sourceRoot)) {
				throw new Error(`Project archive entry is outside the project folder: "${entry.path}".`);
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
		const archive = await readFile(archiveFile);
		const endOffset = findEndOfCentralDirectory(archive);
		const entryCount = archive.readUInt16LE(endOffset + 10);
		const centralDirectorySize = archive.readUInt32LE(endOffset + 12);
		const centralDirectoryOffset = archive.readUInt32LE(endOffset + 16);
		assertZip64IsNotRequired(entryCount, centralDirectorySize, centralDirectoryOffset);
		if (entryCount > limits.maxEntries) {
			throw new Error(`ZIP archive contains too many entries: ${entryCount}.`);
		}
		assertBufferRange(archive, centralDirectoryOffset, centralDirectorySize, 'central directory');

		await mkdir(destinationDirectory, { recursive: true });
		let offset = centralDirectoryOffset;
		let totalUncompressedSize = 0;
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
			assertZip64IsNotRequired(undefined, compressedSize, localHeaderOffset, uncompressedSize);
			const centralEntrySize = 46 + nameLength + extraLength + commentLength;
			assertBufferRange(archive, offset, centralEntrySize, 'central directory entry');
			if (nameLength > limits.maxEntryNameLength) {
				throw new Error('ZIP entry path is too long.');
			}

			if (flags & ENCRYPTED_FLAG) {
				throw new Error('Encrypted ZIP entries are not supported.');
			}
			if (method !== STORE_METHOD && method !== DEFLATE_METHOD) {
				throw new Error(`ZIP compression method ${method} is not supported.`);
			}

			const entryName = archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8').replace(/\\/g, '/');
			const unixMode = externalAttributes >>> 16;
			if ((unixMode & 0o170000) === fsConstants.S_IFLNK) {
				throw new Error(`ZIP symbolic link entries are not supported: "${entryName}".`);
			}

			const targetPath = getSafeTargetPath(destinationDirectory, entryName);
			if (entryName.endsWith('/')) {
				await mkdir(targetPath, { recursive: true });
			} else {
				totalUncompressedSize += uncompressedSize;
				if (totalUncompressedSize > limits.maxTotalUncompressedSize) {
					throw new Error('ZIP archive uncompressed size exceeds the configured limit.');
				}
				const compressedData = getCompressedData(archive, localHeaderOffset, compressedSize);
				const data = method === STORE_METHOD
					? Buffer.from(compressedData)
					: await inflateRawAsync(compressedData, { maxOutputLength: Math.max(1, uncompressedSize) });
				if (data.length !== uncompressedSize || crc32(data) !== expectedCrc) {
					throw new Error(`Invalid ZIP entry data: "${entryName}".`);
				}
				await mkdir(path.dirname(targetPath), { recursive: true });
				await writeFile(targetPath, data);
			}

			offset += centralEntrySize;
		}
	}

	private getEntriesToZip(sourceDirectory: string): EntryToZip[] {
		const projectFilesToZip = ['deploy.xml', 'manifest.xml'];
		const projectFoldersToZip: string[] = [];

		const entriesToZip: EntryToZip[] = [];

		entriesToZip.push(
			...projectFilesToZip.map(
				(file) => <EntryToZip>{ sourceDirectory, relativePath: file, absolutePath: path.join(sourceDirectory, file), isDirectory: false }
			)
		);
		entriesToZip.push(
			...projectFoldersToZip.map(
				(folder) => <EntryToZip>{ sourceDirectory, relativePath: folder, absolutePath: path.join(sourceDirectory, folder), isDirectory: true }
			)
		);

		// FileSystem service?
		let deployXmlContent: string;
		const deployXmlPath = path.join(sourceDirectory, 'deploy.xml');
		try {
			deployXmlContent = fs.readFileSync(deployXmlPath, 'utf8');
		} catch (error) {
			throw new Error(`Unable to read content in ${deployXmlPath}. Error: ${error}`);
		}

		const deployPaths = this.getDeployPaths(deployXmlContent);

		const transformDeployPathToEntryZip = (deployPath: string): EntryToZip => {
			const relativePath = path.normalize(deployPath.replace('~', ''));
			const absolutePath = path.normalize(deployPath.replace('~', sourceDirectory));
			if (deployPath.endsWith('*')) {
				return <EntryToZip>{
					sourceDirectory,
					relativePath: path.dirname(relativePath),
					absolutePath: path.dirname(absolutePath),
					isDirectory: true,
				};
			}
			return <EntryToZip>{ sourceDirectory, relativePath, absolutePath, isDirectory: false };
		};

		const deployEntriesToZip: EntryToZip[] = deployPaths.map(transformDeployPathToEntryZip);

		return entriesToZip.concat(deployEntriesToZip);
	}

	private getDeployPaths(deployXmlContent: string): string[] {
		// TODO: should we add support for installation scripts??? Not implemented yet.
		// https://5363208.app.netsuite.com/app/help/helpcenter.nl?fid=section_1548351067.html
		// https://5363208.app.netsuite.com/app/help/helpcenter.nl?fid=section_1553867014.html
		// https://5363208.app.netsuite.com/app/help/helpcenter.nl?fid=section_1544719586.html
		const exploreDeployXml = {
			rootTag: 'deploy',
			tagsToExplore: ['configuration', 'files', 'objects', 'translationimports'],
		};

		const parsingOptions = {
			attributeNamePrefix: '@_',
			// attrNodeName: 'attr', //default is 'false'
			textNodeName: '#text',
			ignoreAttributes: false,
			ignoreNameSpace: false,
			allowBooleanAttributes: false,
			parseNodeValue: false,
			parseAttributeValue: false,
			trimValues: true,
			arrayMode: /^path$/, // use always arrays for path tags
		};
		const xmlparser = new XMLParser(parsingOptions);
		const deployXmlObject = xmlparser.parse(deployXmlContent);
		const deploy = deployXmlObject[exploreDeployXml.rootTag];

		return exploreDeployXml.tagsToExplore.reduce<string[]>((deployPaths, tagToExplore) => {
			const exploredTagContent  = deploy[tagToExplore];
			if (exploredTagContent  !== undefined) {
				if (Array.isArray(exploredTagContent)) {
					exploredTagContent.forEach(
						tagContentItem => deployPaths.push(...this.getPathsFromTagContentItem(tagContentItem))
					);
				} else {
					deployPaths.push(...this.getPathsFromTagContentItem(exploredTagContent));
				}
			}

			return deployPaths;
		}, []);
	}

	private getPathsFromTagContentItem(tagContentItem: { path: string|string[]|undefined }): string[] {
		const deployPaths: string[] = [];

		const pathTagContent = tagContentItem.path;
		if (Array.isArray(pathTagContent)) {
			pathTagContent.forEach(pathItem => {
				if (pathItem.length > 0) {
					deployPaths.push(pathItem);
				}
			})

		} else if (typeof pathTagContent  === 'string' && pathTagContent .length > 0) {
			deployPaths.push(pathTagContent);
		}

		return deployPaths;
	}

	private async zip(entriesToZip: EntryToZip[], destinationFile: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const finalDestinationFile = path.normalize(destinationFile);
			const output = fs.createWriteStream(finalDestinationFile);
			const archive = archiver.create('zip');
			let settled = false;

			const rejectOnce = (error: unknown): void => {
				if (settled) {
					return;
				}
				settled = true;
				archive.abort();
				output.destroy();
				reject(error);
			};

			output.on('close', function () {
				if (settled) {
					return;
				}
				settled = true;
				// console.log(`Desired packaged project can be found at: "${finalDestinationFile}".`);
				//archiver has been finalized and the output file descriptor has closed.
				resolve(finalDestinationFile);
			});
			output.on('error', rejectOnce);

			archive.on('error', function (err) {
				rejectOnce(err);
			});

			archive.pipe(output);

			for (const entry of entriesToZip) {
				try {
					const entryStats = fs.lstatSync(entry.absolutePath);
					if (entryStats.isFile()) {
						archive.file(entry.absolutePath, {
							name: entry.relativePath,
						});
					}
					if (entryStats.isDirectory()) {
						if (entry.includeDirectoryContents === false) {
							archive.append(Buffer.alloc(0), { name: `${entry.relativePath.replace(/\/$/, '')}/` });
						} else {
							archive.directory(entry.absolutePath, entry.relativePath);
						}
					}
				} catch (error: unknown) {
					// don't add the file/foler if we cannot read it.
					// should we show a warning about a missing file/folder reference
					interface ErrorWithCodeAndPath extends Error {
						code: string;
						path: string;
					}
					// if error.code = ENOENT: no such file or directory
					// don't reject, just skipp the file/directory
					if ((error as ErrorWithCodeAndPath).code !== 'ENOENT') {
						if ((error as ErrorWithCodeAndPath).code === 'EPERM' && (error as ErrorWithCodeAndPath).path) {
							// EPERM: operation not permitted
							// reject referencing the file/directory that couldn't be accessed
							const errorMessage =`Unable to read content in ${(error as ErrorWithCodeAndPath).path}. Error: ${error}`
							rejectOnce(Error(errorMessage));
							return;
						}

						rejectOnce(error);
						return;
					}
				}
			}

			archive.finalize().catch(rejectOnce);
		});
	}
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

function getSafeTargetPath(destinationDirectory: string, entryName: string): string {
	if (!entryName || entryName.includes('\0') || entryName.startsWith('/') || /^[A-Za-z]:\//.test(entryName)) {
		throw new Error(`Invalid ZIP entry path: "${entryName}".`);
	}
	const parts = entryName.split('/');
	if (parts.some((part) => part === '..')) {
		throw new Error(`Invalid ZIP entry path: "${entryName}".`);
	}
	const destinationRoot = path.resolve(destinationDirectory);
	const targetPath = path.resolve(destinationRoot, ...parts.filter((part) => part !== '' && part !== '.'));
	if (targetPath !== destinationRoot && !targetPath.startsWith(`${destinationRoot}${path.sep}`)) {
		throw new Error(`Invalid ZIP entry path: "${entryName}".`);
	}
	return targetPath;
}

function getUnzipLimits(options: UnzipOptions): Required<UnzipOptions> {
	return {
		maxEntries: getPositiveLimit(options.maxEntries, DEFAULT_UNZIP_MAX_ENTRIES, 'maxEntries'),
		maxTotalUncompressedSize: getPositiveLimit(
			options.maxTotalUncompressedSize,
			DEFAULT_UNZIP_MAX_TOTAL_UNCOMPRESSED_SIZE,
			'maxTotalUncompressedSize'
		),
		maxEntryNameLength: getPositiveLimit(
			options.maxEntryNameLength,
			DEFAULT_UNZIP_MAX_ENTRY_NAME_LENGTH,
			'maxEntryNameLength'
		),
	};
}

function getPositiveLimit(value: number | undefined, defaultValue: number, name: string): number {
	if (value === undefined) {
		return defaultValue;
	}
	if (!Number.isSafeInteger(value) || value <= 0) {
		throw new Error(`Invalid ZIP extraction limit: ${name}.`);
	}
	return value;
}

function assertZip64IsNotRequired(
	entryCount?: number,
	...offsetsOrSizes: number[]
): void {
	if (entryCount === ZIP64_ENTRY_COUNT_SENTINEL || offsetsOrSizes.some((value) => value === ZIP64_OFFSET_OR_SIZE_SENTINEL)) {
		throw new Error('ZIP64 archives are not supported.');
	}
}

function isPathWithinDirectory(targetPath: string, directoryPath: string): boolean {
	const resolvedTargetPath = normalizePathForComparison(path.resolve(targetPath));
	const resolvedDirectoryPath = normalizePathForComparison(path.resolve(directoryPath));
	return resolvedTargetPath === resolvedDirectoryPath || resolvedTargetPath.startsWith(`${resolvedDirectoryPath}${path.sep}`);
}

function normalizePathForComparison(filepath: string): string {
	return process.platform === 'win32' ? filepath.toLowerCase() : filepath;
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

function crc32(data: Buffer): number {
	let crc = 0xffffffff;
	for (let index = 0; index < data.length; index++) {
		const byte = data[index];
		crc ^= byte;
		for (let bit = 0; bit < 8; bit++) {
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}
