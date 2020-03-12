/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lstatSync, readdirSync, readFile, writeFile, mkdirSync, renameSync, existsSync, unlinkSync, rmdirSync } = require('fs');
const assert = require('assert');
const path = require('path');

const CHAR_ENCODING_UTF8 = 'utf-8';

module.exports = class FileSystemService {
	getFoldersFromDirectory(parentFolder) {
		assert(parentFolder);
		const getDirectories = source =>
			readdirSync(source)
				.map(name => path.join(source, name))
				.filter(source => lstatSync(source).isDirectory());

		const availableDirectories = getDirectories(parentFolder);

		return [parentFolder, ...availableDirectories];
	}

	getFilesFromDirectory(parentFolder) {
		assert(parentFolder);
		const fullPathFiles = [];
		const getFilesRecursively = source =>
			readdirSync(source).forEach(file => {
				const fullPath = path.join(source, file);
				if (lstatSync(fullPath).isDirectory()) {
					getFilesRecursively(fullPath);
				} else {
					fullPathFiles.push(fullPath);
				}
			});

		getFilesRecursively(parentFolder);
		return fullPathFiles;
	}

	createFileFromTemplate(options) {
		assert(options.template);
		assert(options.destinationFolder);
		assert(options.fileName);
		assert(options.fileExtension);

		return new Promise((resolve, reject) => {
			readFile(options.template, CHAR_ENCODING_UTF8, (readingError, content) => {
				if (readingError) {
					reject(readingError);
				}
				if (Array.isArray(options.bindings)) {
					content = this._processTemplateBindings(content, options.bindings);
				}

				writeFile(
					path.join(options.destinationFolder, `${options.fileName}.${options.fileExtension}`),
					content.toString(),
					(writingError, data) => {
						if (writingError) {
							reject(writingError);
						}
						resolve();
					}
				);
			});
		});
	}

	createFolder(parentFolderPath, folderName) {
		assert(parentFolderPath);
		assert(folderName);

		let targetFolder = path.join(parentFolderPath, folderName);

		if (!existsSync(targetFolder)) {
			mkdirSync(path.join(targetFolder));
		}

		return targetFolder;
	}

	renameFolder(oldPath, newPath) {
		assert(oldPath);
		assert(newPath);

		if (existsSync(oldPath) && oldPath !== newPath) {
			renameSync(oldPath, newPath);
		}
	}

	deleteFolderRecursive(folderPath) {
		assert(folderPath);

		let self = this;
		if (existsSync(folderPath)) {
			readdirSync(folderPath).forEach(file => {
				let currentPath = path.join(folderPath, file);
				if (lstatSync(currentPath).isDirectory()) {
					self.deleteFolderRecursive(currentPath);
				} else {
					unlinkSync(currentPath);
				}
			});
			rmdirSync(folderPath);
		}
	}

	emptyFolderRecursive(folderPath) {
		assert(folderPath);
		let self = this;
		if (existsSync(folderPath)) {
			readdirSync(folderPath).forEach(file => {
				let currentPath = path.join(folderPath, file);
				if (lstatSync(currentPath).isDirectory()) {
					self.deleteFolderRecursive(currentPath);
				} else {
					unlinkSync(currentPath);
				}
			});
		}
	}

	replaceStringInFile(filePath, fromString, toString) {
		assert(filePath);
		assert(fromString);
		assert(toString);

		return new Promise((resolve, reject) => {
			readFile(filePath, CHAR_ENCODING_UTF8, (readingError, content) => {
				if (readingError) {
					reject(readingError);
				}

				let result = content.replace(new RegExp(fromString, 'g'), toString);

				writeFile(filePath, result, function(writingError) {
					if (writingError) {
						reject(writingError);
					}

					resolve();
				});
			});
		});
	}

	folderExists(path) {
		assert(path);
		return existsSync(path);
	}

	isFolderEmpty(path) {
		assert(path);
		readdirSync(path).length !== 0;
	}

	_processTemplateBindings(content, bindings) {
		let processedContent = content;
		bindings.forEach(binding => {
			processedContent = content.replace(`{{${binding.id}}}`, binding.value);
		});
		return processedContent;
	}
};
