const jest = require('jest');
const UnitTestTranslationService = require('./UnitTestTranslationService');
const TranslationKeys = require('./TranslationKeys');

const projectFolderArg = "--projectFolder";

function getProjectFolder(args) {
	if (args.projects && args.projects.length > 0) {
		return args.projects;
	} else if (process.argv && process.argv.length > 0) {
		for (let i = 0; i < process.argv.length; i++) {
			let argv = process.argv[i].split('=');
			if (argv.length === 2 && argv[0] === projectFolderArg) {
				return [argv[1]];
			}
		}
	}
	return [process.cwd()];
}

module.exports = {
	run: async function (args) {
		try {
			const jestResult = await jest.runCLI(args, getProjectFolder(args));
			if (!jestResult.results.success) {
				throw UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.TEST_FAILED);
			}
		} catch (error) {
			throw UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.TEST_FAILURES_PRESENT);
		}
	},
};
