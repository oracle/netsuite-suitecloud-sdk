const jest = require('jest');
const TranslationService = require('../../src/services/TranslationService');
const {
	UNIT_TEST: { MESSAGES },
} = require('../../src/services/TranslationKeys');

module.exports = {
	run: async function(args) {
		try {
			const jestResult = await jest.runCLI(args, [process.cwd()]);
			if (!jestResult.results.success) {
				throw TranslationService.getMessage(MESSAGES.UNIT_TEST.TEST_FAILED);
			}
		} catch (error) {
			throw TranslationService.getMessage(MESSAGES.UNIT_TEST.TEST_FAILURES_PRESENT);
		}
	}
};
