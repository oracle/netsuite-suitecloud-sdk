const jest = require('jest');
const suiteCloudUnitTestRunner = require('SuiteCloudUnitTestRunner');

module.exports = {
	defaultProjectFolder: 'src',
	commands: {
		deploy: {
			beforeExecuting: async args => {
				await suiteCloudUnitTestRunner.run({jestOptions : args});
				return args;
			},
		},
	},
};