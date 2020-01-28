const jest = require('jest');
const TranslationService = require('./TranslationService');
const TranslationKeys = require('./TranslationKeys');

module.exports = {
	run: async function(args) {
		try {
			const jestResult = await jest.runCLI(args, [process.cwd()]);
			if (!jestResult.results.success) {
				throw TranslationService.getMessage(TranslationKeys.ERRORS.TEST_FAILED);
			}
		} catch (error) {
			throw TranslationService.getMessage(TranslationKeys.ERRORS.TEST_FAILURES_PRESENT);
		}
	}
};
