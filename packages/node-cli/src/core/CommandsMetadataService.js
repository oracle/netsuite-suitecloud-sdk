/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const FileUtils = require('../utils/FileUtils');
const {
	SDK_COMMANDS_METADATA_FILE,
	SDK_COMMANDS_METADATA_PATCH_FILE,
	NODE_COMMANDS_METADATA_FILE,
	COMMAND_GENERATORS_METADATA_FILE,
} = require('../ApplicationConstants');

let commandsMetadataCache;

function executeForEachCommandMetadata(commandsMetadata, func) {
	for (const commandMetadataId in commandsMetadata) {
		if (commandsMetadata.hasOwnProperty(commandMetadataId)) {
			const commandMetadata = commandsMetadata[commandMetadataId];
			func(commandMetadata);
		}
	}
}

module.exports = class CommandsMetadataService {
	constructor() {
		this._rootCLIPath = path.dirname(__dirname, '../');
		this._initializeCommandsMetadata();
	}

	_initializeCommandsMetadata() {
		if (!commandsMetadataCache) {
			const sdkCommandsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, SDK_COMMANDS_METADATA_FILE));
			const SdkCommandsMetadataPatch = this._getMetadataFromFile(path.join(this._rootCLIPath, SDK_COMMANDS_METADATA_PATCH_FILE));
			const nodeCommandsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, NODE_COMMANDS_METADATA_FILE));
			const commandGeneratorsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, COMMAND_GENERATORS_METADATA_FILE));

			let combinedSdkCommandMetadata = this._combineMetadata(sdkCommandsMetadata, SdkCommandsMetadataPatch);
			let combinedMetadata = {
				...combinedSdkCommandMetadata,
				...nodeCommandsMetadata,
			};
			combinedMetadata = this._addCommandGeneratorMetadata(commandGeneratorsMetadata, combinedMetadata);
			commandsMetadataCache = combinedMetadata;
		}
	}

	_combineMetadata(sdkCommandsMetadata, modifiedSdkCommandsMetadata) {
		return this._replaceObjectProperties(sdkCommandsMetadata, modifiedSdkCommandsMetadata);
	}

	_replaceObjectProperties(originalObject, newObject) {
		const resultObject = originalObject;
		Object.entries(newObject).forEach((entry) => {
			const [propertyKey, propertyValue] = entry;
			resultObject[propertyKey] = this._replacePropertyValue(originalObject[propertyKey], propertyValue);
		});
		return resultObject;
	}

	_replacePropertyValue(originalPropertyValue, newPropertyValue) {
		if (originalPropertyValue && typeof newPropertyValue === 'object') {
			return this._replaceObjectProperties(originalPropertyValue, newPropertyValue);
		} else {
			return newPropertyValue;
		}
	}

	getCommandsMetadata() {
		return commandsMetadataCache;
	}

	getCommandMetadataByName(commandName) {
		const commandMetadata = commandsMetadataCache[commandName];
		if (!commandMetadata) {
			throw `No metadata found or initialized for Command ${commandName}`;
		}
		return commandMetadata;
	}

	_getMetadataFromFile(filepath) {
		if (!FileUtils.exists(filepath)) {
			throw `Commands Metadata in filepath ${filepath} not found`;
		}
		try {
			return FileUtils.readAsJson(filepath);
		} catch (error) {
			throw `Error parsing Commands Metadata from ${filepath}`;
		}
	}

	_addCommandGeneratorMetadata(commandGeneratorsMetadata, commandsMetadata) {
		executeForEachCommandMetadata(commandsMetadata, (commandMetadata) => {
			const generatorMetadata = commandGeneratorsMetadata.find((generatorMetadata) => {
				return generatorMetadata.commandName === commandMetadata.name;
			});
			commandMetadata.generator = path.join(this._rootCLIPath, generatorMetadata.generator);
			commandMetadata.supportsInteractiveMode = generatorMetadata.supportsInteractiveMode;
		});
		return commandsMetadata;
	}
};
