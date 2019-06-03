const assert = require('assert');

module.exports = class CommandInstanceFactory {
	create(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(typeof options.runInInteractiveMode === 'boolean');

		const commandMetadata = options.commandMetadata;
		const commandGeneratorPath = options.runInInteractiveMode
			? commandMetadata.interactiveGenerator
			: commandMetadata.nonInteractiveGenerator;

		const Generator = require(commandGeneratorPath);
		const generatorInstance = new Generator({
			commandMetadata,
			projectFolder: options.projectFolder,
		});

		return generatorInstance.create();
	}
};
