const jest = require('jest');

module.exports = {
	run: async function(args) {
		try {
			const jestResult = await jest.runCLI(args.jestOptions, [process.cwd()]);
			if (!jestResult.results.success) {
				throw 'The tests failed';
			}
			return args;
		} catch (error) {
			throw 'There are some Test failures, The Deployment will not continue.';
		}
	}
}
