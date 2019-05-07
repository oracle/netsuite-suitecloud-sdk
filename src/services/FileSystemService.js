const {
	lstatSync,
	readdirSync,
	readFile,
	writeFile,
	mkdirSync,
	renameSync,
	existsSync,
	unlinkSync,
	rmdirSync,
} = require('fs');
const assert = require('assert');
const { join } = require('path');

const CHAR_ENCODING_UTF8 = 'utf-8';

module.exports = class FileService {	
	getFoldersFromDirectory(parentFolder) {
		assert(parentFolder);
		const getDirectories = source =>
			readdirSync(source)
				.map(name => join(source, name))
				.filter(source => lstatSync(source).isDirectory());

		var availableDirectories = getDirectories(parentFolder);

		return [parentFolder, ...availableDirectories];
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
					join(options.destinationFolder, `${options.fileName}.${options.fileExtension}`),
					content.toString(),
					(writtingError, data) => {
						if (writtingError) {
							reject(writtingError);
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

		let targetFolder = join(parentFolderPath, folderName);

		if (!existsSync(targetFolder)) {
			mkdirSync(join(targetFolder));
		}
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
				let currentPath = join(folderPath, file);
				if (lstatSync(currentPath).isDirectory()) {
					// recurse
					self.deleteFolderRecursive(currentPath);
				} else {
					// delete file
					unlinkSync(currentPath);
				}
			});
			rmdirSync(folderPath);
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
		return existsSync(path)
	}

	isFolderEmpty(path) {
		assert(path);
		readdirSync(path).length != 0
	}

	_processTemplateBindings(content, bindings) {
		var processedContent = content;
		bindings.forEach(binding => {
			processedContent = content.replace(`{{${binding.id}}}`, binding.value);
		});
		return processedContent;
	}
};
