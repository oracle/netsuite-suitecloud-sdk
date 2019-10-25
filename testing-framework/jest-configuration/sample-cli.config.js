const jest = require('jest');

module.exports = {
	defaultProjectFolder: 'src',
	commands: {
		deploy: {
			beforeExecuting: async args => {
				try {
					//{ cache: false } as options for runCLI
					const jestResult = await jest.runCLI({}, [process.cwd()]);
					if (!jestResult.results.success) {
						throw 'The tests failed';
					}

					return args;
				} catch (error) {
					throw 'There are some Test failures, The Deployment will not continue.';
				}
			},
		},
	},
};
