const nodeModulesToTransform = [
	'@oracle/netsuite-suitecloud-node-cli/testing-framework/mocks',
].join('|');

module.exports = {
	transformIgnorePatterns: [`/node_modules/(?!${nodeModulesToTransform})`],
	moduleNameMapper: {
		'^N/record$':
			'<rootDir>/node_modules/@oracle/netsuite-suitecloud-node-cli/testing-framework/mocks/record.js',
		'^InternalRecord$':
			'<rootDir>/node_modules/@oracle/netsuite-suitecloud-node-cli/testing-framework/mocks/InternalRecord.js',
		'^Line$':
			'<rootDir>/node_modules/@oracle/netsuite-suitecloud-node-cli/testing-framework/mocks/Line.js',
		'^Sublist$':
			'<rootDir>/node_modules/@oracle/netsuite-suitecloud-node-cli/testing-framework/mocks/Sublist.js',
		//... add all mocks here. This is to link the JEST alias
		'^SuiteScripts(.*)$': '<rootDir>/src/FileCabinet/SuiteScripts$1', //this is to reference files within "FileCabinet/SuiteScripts" and avoid doing "../src/FileCabinet..."
	},
	transform: {
		'^.+\\.js$':
			'<rootDir>/node_modules/@oracle/netsuite-suitecloud-node-cli/testing-framework/jest-preset/jest.transform.js',
	},
};
