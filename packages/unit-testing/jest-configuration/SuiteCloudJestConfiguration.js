const assert = require('assert');
const TESTING_FRAMEWORK_PATH = '@oracle/netsuite-suitecloud-unit-testing';
const CORE_STUBS_PATH = `${TESTING_FRAMEWORK_PATH}/stubs`;
const nodeModulesToTransform = [CORE_STUBS_PATH].join('|');
const SUITESCRIPT_FOLDER_REGEX = '^SuiteScripts(.*)$';
const ProjectInfoService = require('../services/ProjectInfoService');

const PROJECT_TYPE = {
	SUITEAPP: 'SUITEAPP',
	ACP: 'ACP',
};

const CORE_STUBS = [
	{
		module: 'N/record',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record.js`,
	},
	{
		module: 'N/record/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/RecordInstance.js`,
	},
	{
		module: 'N/record/line',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/RecordInstanceLine.js`,
	},
	{
		module: 'N/record/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/RecordInstanceSublist.js`,
	},
];

class SuiteCloudAdvancedJestConfiguration {
	constructor(options) {
		assert(options.projectFolder, "The 'projecFolder' property must be specified to generate a SuiteCloud Jest configuration");
		assert(options.projectType, "The 'projectType' property must be specified to generate a SuiteCloud Jest configuration");
		this.projectFolder = options.projectFolder;
		this.projectType = options.projectType;
		this.customStubs = options.customStubs;
		if (this.customStubs == null) {
			this.customStubs = [];
		}

		this.projectInfoService = new ProjectInfoService(this.projectFolder);
	}

	_getSuiteScriptFolderPath() {
		if (this.projectType === PROJECT_TYPE.ACP) {
			return `<rootDir>/${this.projectFolder}/FileCabinet/SuiteScripts$1`;
		}
		if (this.projectType === PROJECT_TYPE.SUITEAPP) {
			let applicationId = this.projectInfoService.getApplicationId();
			return `<rootDir>/${this.projectFolder}/FileCabinet/SuiteApps/${applicationId}$1`;
		}
		throw 'Unrecognized projectType. Please revisit your SuiteCloud Jest configuration';
	}

	_generateStubsModuleNameMapperEntries() {
		const stubs = {};
		const forEachFn = stub => {
			stubs[`^${stub.module}$`] = stub.path;
		};
		CORE_STUBS.forEach(forEachFn);
		this.customStubs.forEach(forEachFn);

		return stubs;
	}

	generate() {
		const suiteScriptsFolder = {};
		suiteScriptsFolder[SUITESCRIPT_FOLDER_REGEX] = this._getSuiteScriptFolderPath();

		const customizedModuleNameMapper = Object.assign({}, this._generateStubsModuleNameMapperEntries(), suiteScriptsFolder);
		return {
			transformIgnorePatterns: [`/node_modules/(?!${nodeModulesToTransform})`],
			transform: {
				'^.+\\.js$': `<rootDir>/node_modules/${TESTING_FRAMEWORK_PATH}/jest-configuration/SuiteCloudJestTransformer.js`,
			},
			moduleNameMapper: customizedModuleNameMapper,
		};
	}
}

module.exports = {
	build: options => {
		return new SuiteCloudAdvancedJestConfiguration(options).generate();
	},
	ProjectType: PROJECT_TYPE,
};
