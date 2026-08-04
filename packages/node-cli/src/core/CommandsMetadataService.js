/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const sdkCommandsMetadata = require('../metadata/SdkCommandsMetadata.json');
const sdkCommandsMetadataPatch = require('../metadata/SdkCommandsMetadataPatch.json');
const nodeCommandsMetadata = require('../metadata/NodeCommandsMetadata.json');
const commandGeneratorsMetadata = require('../metadata/CommandGenerators.json');

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
		this._initializeCommandsMetadata();
	}

	_initializeCommandsMetadata() {
		if (!commandsMetadataCache) {
			let combinedSdkCommandMetadata = this._combineMetadata(structuredClone(sdkCommandsMetadata), sdkCommandsMetadataPatch);
			let combinedMetadata = {
				...combinedSdkCommandMetadata,
				...structuredClone(nodeCommandsMetadata),
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

	_addCommandGeneratorMetadata(commandGeneratorsMetadata, commandsMetadata) {
		executeForEachCommandMetadata(commandsMetadata, (commandMetadata) => {
			const generatorMetadata = commandGeneratorsMetadata.find((generatorMetadata) => {
				return generatorMetadata.commandName === commandMetadata.name;
			});
			commandMetadata.generator = generatorMetadata.commandName;
			commandMetadata.supportsInteractiveMode = generatorMetadata.supportsInteractiveMode;
		});
		return commandsMetadata;
	}
};
