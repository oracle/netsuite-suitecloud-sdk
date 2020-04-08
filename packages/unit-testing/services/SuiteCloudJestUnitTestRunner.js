const jest = require('jest');
const UnitTestTranslationService = require('./UnitTestTranslationService');
const TranslationKeys = require('./TranslationKeys');

module.exports = {
	run: async function(args) {
		try {
			const jestResult = await jest.runCLI(args, [process.cwd()]);
			if (!jestResult.results.success) {
				throw UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.TEST_FAILED);
			}
		} catch (error) {
			throw UnitTestTranslationService.getMessage(TranslationKeys.ERRORS.TEST_FAILURES_PRESENT);
		}
	}
};
