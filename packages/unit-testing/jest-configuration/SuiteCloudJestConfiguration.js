const assert = require('assert');
const path = require('path');
const { PROJECT_FOLDER_ARG } = require('../ApplicationConstants');
const TESTING_FRAMEWORK_PATH = '@oracle/suitecloud-unit-testing';
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
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/record.js`,
	},
	{
		module: 'N/record/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/RecordInstance.js`,
	},
	{
		module: 'N/record/line',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/RecordInstanceLine.js`,
	},
	{
		module: 'N/record/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/RecordInstanceSublist.js`,
	},
	{
		module: 'N/search',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/search.js`,
	},
	{
		module: 'N/search/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchInstance.js`,
	},
	{
		module: 'N/search/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Column.js`,
	},
	{
		module: 'N/search/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Result.js`,
	},
	{
		module: 'N/search/resultset',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/ResultSet.js`,
	},
	{
		module: 'N/search/pageddata',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPagedData.js`,
	},
	{
		module: 'N/search/pagerange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPageRange.js`,
	},
	{
		module: 'N/search/setting',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Setting.js`,
	},
];

class SuiteCloudAdvancedJestConfiguration {
	constructor(options) {
		assert(options.projectFolder, "The 'projecFolder' property must be specified to generate a SuiteCloud Jest configuration");
		assert(options.projectType, "The 'projectType' property must be specified to generate a SuiteCloud Jest configuration");
		this.projectFolder = this._getProjectFolder(options.projectFolder);
		this.projectType = options.projectType;
		this.customStubs = options.customStubs;
		if (this.customStubs == null) {
			this.customStubs = [];
		}

		this.projectInfoService = new ProjectInfoService(this.projectFolder);
	}

	_getProjectFolder(projectFolder) {
		if (process.argv && process.argv.length > 0) {
			for (let i = 0; i < process.argv.length; i++) {
				let argv = process.argv[i].split('=');
				if (argv.length === 2 && argv[0] === PROJECT_FOLDER_ARG) {
					return path.join(argv[1], projectFolder);
				}
			}
		}
		return path.join(process.cwd(), projectFolder);
	}

	_getSuiteScriptFolderPath() {
		if (this.projectType === PROJECT_TYPE.ACP) {
			return `${this.projectFolder}/FileCabinet/SuiteScripts$1`;
		}
		if (this.projectType === PROJECT_TYPE.SUITEAPP) {
			let applicationId = this.projectInfoService.getApplicationId();
			return `${this.projectFolder}/FileCabinet/SuiteApps/${applicationId}$1`;
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
