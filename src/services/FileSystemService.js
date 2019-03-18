const { lstatSync, readdirSync, readFile, writeFile } = require('fs');
const assert = require('assert');
const { join } = require('path');

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
			readFile(options.template, 'utf-8', (readingError, content) => {
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

	_processTemplateBindings(content, bindings) {
		var processedContent = content;
		bindings.forEach(binding => {
			processedContent = content.replace(`{{${binding.id}}}`, binding.value);
		});
		return processedContent;
	}
};
