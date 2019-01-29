const path = require('path');
const FileUtils = require('../utils/FileUtils');
const ApplicationConstants = require('../ApplicationConstants');

function executeForEachCommandMetadata(commandsMetadata, func) {
    for (const commandMetadataId in commandsMetadata) {
        if (commandsMetadata.hasOwnProperty(commandMetadataId)) {
            const commandMetadata = commandsMetadata[commandMetadataId];
            func(commandMetadata);
        }
    }
}

class CommandsMetadataService {

    _getMetadataFromFile(file) {
        var metadata;
        var metadataFilePath = path.join(__dirname, file);
        if (FileUtils.exists(metadataFilePath)) {
            metadata = FileUtils.readAsJson(metadataFilePath);
            return metadata;
        }
        throw new Error(`Error loading Commands Metadata from ${metadataFilePath}`);
    }
    _transformCommandsOptionsToObject(commandsMetadata) {
        executeForEachCommandMetadata(commandsMetadata, (commandMetadata) => {
            var optionsTransformedIntoObject = commandMetadata.options.reduce((result, item) => {
                if (item.name == null)
                    throw new Error('Invalid Metadata, mising id property in command options');
                result[item.name] = item;
                return result;
            }, {});
            commandMetadata.options = optionsTransformedIntoObject;
        })
        return commandsMetadata;
    }
    _addCommandGeneratorMetadata(commandGeneratorsMetadata, commandsMetadata) {
        executeForEachCommandMetadata(commandsMetadata, (commandMetadata) => {
            var generatorMetadata = commandGeneratorsMetadata.find((generatorMetadata) => {
                return generatorMetadata.commandName == commandMetadata.name;
            });

            commandMetadata.commandGenerator = generatorMetadata && generatorMetadata.generator ?
                generatorMetadata.generator :
                "./commands/SDKWrapperCommandGenerator";
        })
        return commandsMetadata
    }
    getCommandsMetadata() {
        var sdkCommandsMetadata = this._getMetadataFromFile(ApplicationConstants.SDK_COMMANDS_METADATA_FILE);
        var nodeCommandsMetadata = this._getMetadataFromFile(ApplicationConstants.NODE_COMMANDS_METADATA_FILE);
        var commandGeneratorsMetadata = this._getMetadataFromFile(ApplicationConstants.COMMAND_GENERATORS_METADATA_FILE);
        var combinedMetadata = {
            ...sdkCommandsMetadata,
            ...nodeCommandsMetadata
        };
        combinedMetadata = this._transformCommandsOptionsToObject(combinedMetadata);
        combinedMetadata = this._addCommandGeneratorMetadata(commandGeneratorsMetadata, combinedMetadata);
        return combinedMetadata;
    }
}

module.exports = new CommandsMetadataService();