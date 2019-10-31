const jest = require('jest');
const TranslationService = require('../../src/services/TranslationService');
const {
	UNIT_TEST: { MESSAGES },
} = require('../../src/services/TranslationKeys');

module.exports = {
	run: async function(args) {
		try {
			const jestResult = await jest.runCLI(args.jestOptions, [process.cwd()]);
			if (!jestResult.results.success) {
				throw TranslationService.getMessage(MESSAGES.UNIT_TEST.TEST_FAILED);
			}
			return args;
		} catch (error) {
			throw TranslationService.getMessage(MESSAGES.UNIT_TEST.TEST_FAILURES_PRESENT);
		}
	}
};
