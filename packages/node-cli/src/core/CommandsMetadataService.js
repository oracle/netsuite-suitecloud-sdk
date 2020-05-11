/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const FileUtils = require('../utils/FileUtils');
const { SDK_COMMANDS_METADATA_FILE, NODE_COMMANDS_METADATA_FILE, COMMAND_GENERATORS_METADATA_FILE } = require('../ApplicationConstants');
const SDK_WRAPPER_GENERATOR = 'commands/SdkWrapperCommandGenerator';
let COMMANDS_METADATA_CACHE;

function executeForEachCommandMetadata(commandsMetadata, func) {
	for (const commandMetadataId in commandsMetadata) {
		if (commandsMetadata.hasOwnProperty(commandMetadataId)) {
			const commandMetadata = commandsMetadata[commandMetadataId];
			func(commandMetadata);
		}
	}
}

module.exports = class CommandsMetadataService {
	constructor(rootCLIPath) {
		this._rootCLIPath = rootCLIPath;
	}
	initializeCommandsMetadata() {
		const sdkCommandsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, SDK_COMMANDS_METADATA_FILE));
		const nodeCommandsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, NODE_COMMANDS_METADATA_FILE));
		const commandGeneratorsMetadata = this._getMetadataFromFile(path.join(this._rootCLIPath, COMMAND_GENERATORS_METADATA_FILE));
		let combinedMetadata = {
			...sdkCommandsMetadata,
			...nodeCommandsMetadata,
		};
		combinedMetadata = this._transformCommandsOptionsToObject(combinedMetadata);
		combinedMetadata = this._addCommandGeneratorMetadata(commandGeneratorsMetadata, combinedMetadata);
		COMMANDS_METADATA_CACHE = combinedMetadata;
	}

	getCommandsMetadata() {
		return COMMANDS_METADATA_CACHE;
	}

	getCommandMetadataByName(commandName) {
		const commandMetadata = COMMANDS_METADATA_CACHE[commandName];
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

	_transformCommandsOptionsToObject(commandsMetadata) {
		executeForEachCommandMetadata(commandsMetadata, commandMetadata => {
			const optionsTransformedIntoObject = commandMetadata.options.reduce((result, item) => {
				if (item.name == null) {
					throw 'Invalid Metadata, missing "name" property in command options';
				}
				result[item.name] = item;
				return result;
			}, {});
			commandMetadata.options = optionsTransformedIntoObject;
		});
		return commandsMetadata;
	}

	_addCommandGeneratorMetadata(commandGeneratorsMetadata, commandsMetadata) {
		executeForEachCommandMetadata(commandsMetadata, commandMetadata => {
			const generatorMetadata = commandGeneratorsMetadata.find(generatorMetadata => {
				return generatorMetadata.commandName === commandMetadata.name;
			});

			const defaultGenerator = generatorMetadata && generatorMetadata.nonInteractiveGenerator
				? generatorMetadata.nonInteractiveGenerator
				: SDK_WRAPPER_GENERATOR;
			commandMetadata.nonInteractiveGenerator = path.join(this._rootCLIPath, defaultGenerator);
			commandMetadata.supportsInteractiveMode = false;

			if (generatorMetadata && generatorMetadata.interactiveGenerator) {
				commandMetadata.interactiveGenerator = path.join(this._rootCLIPath, generatorMetadata.interactiveGenerator);
				commandMetadata.supportsInteractiveMode = true;
			}
		});
		return commandsMetadata;
	}
};
