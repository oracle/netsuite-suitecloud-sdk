/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const FileUtils = require('../utils/FileUtils');
const {
	SDK_COMMANDS_METADATA_FILE,
	MODIFIED_SDK_DESCRIPTIONS_FOR_NODECLI_METADATA_FILE: SDK_COMMANDS_MODIFIED_METADATA_FILE,
	NODE_COMMANDS_METADATA_FILE,
	COMMAND_GENERATORS_METADATA_FILE,
} = require('../ApplicationConstants');
const SDK_WRAPPER_GENERATOR = 'commands/SdkWrapperCommandGenerator';

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
			const modifiedSdkCommandsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, SDK_COMMANDS_MODIFIED_METADATA_FILE));
			const nodeCommandsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, NODE_COMMANDS_METADATA_FILE));
			const commandGeneratorsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, COMMAND_GENERATORS_METADATA_FILE));

			let combinedSdkCommandMetadata = this._combineMetadata(sdkCommandsMetadata, modifiedSdkCommandsMetadata);
			let combinedMetadata = {
				...combinedSdkCommandMetadata,
				...nodeCommandsMetadata,
			};
			combinedMetadata = this._addCommandGeneratorMetadata(commandGeneratorsMetadata, combinedMetadata);
			commandsMetadataCache = combinedMetadata;
		}
	}

	_combineMetadata(sdkCommandsMetadata, modifiedSdkCommandsMetadata) {
		let combinedMetadata = sdkCommandsMetadata;
		Object.entries(modifiedSdkCommandsMetadata).forEach((entry) => {
			const [command, properties] = entry;
			let originalCommand = sdkCommandsMetadata[command];
			let newCommand;
			if (originalCommand) {
				newCommand = this._replaceCommandProperties(originalCommand, properties);
			} else {
				newCommand = properties;
			}
			combinedMetadata[command] = newCommand;
		});
		return combinedMetadata;
	}

	_replaceCommandProperties(originalCommand, properties) {
		let newCommand = originalCommand;
		Object.entries(properties).forEach((entry) => {
			const [property, newPropertyValue] = entry;
			newCommand[property] = this._replaceProperty(originalCommand[property], newPropertyValue);
		});
		return newCommand;
	}

	_replaceProperty(originalPropertyValue, newPropertyValue) {
		if (typeof newPropertyValue === 'object') {
			return this._replaceCommandProperties(originalPropertyValue, newPropertyValue);
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
