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
		module: 'N/action',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/action/action.js`,
	},
	{
		module: 'N/action/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/action/ActionInstance.js`,
	},
	{
		module: 'N/auth',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/auth/auth.js`,
	},
	{
		module: 'N/cache',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/cache/cache.js`,
	},
	{
		module: 'N/cache/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/cache/CacheInstance.js`,
	},
	{
		module: 'N/currency',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currency/currency.js`,
	},
	{
		module: 'N/email',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/email/email.js`,
	},
	{
		module: 'N/http',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/http/http.js`,
	},
	{
		module: 'N/http/clientResponse',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/http/ClientResponse.js`,
	},
	{
		module: 'N/https',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/https.js`,
	},
	{
		module: 'N/https/clientResponse',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/ClientResponse.js`,
	},
	{
		module: 'N/https/secretKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/SecretKey.js`,
	},
	{
		module: 'N/https/secureString',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/SecureString.js`,
	},
	{
		module: 'N/query',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/query.js`,
	},
	{
		module: 'N/query/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/QueryInstance.js`,
	},
	{
		module: 'N/query/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Column.js`,
	},
	{
		module: 'N/query/component',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Component.js`,
	},
	{
		module: 'N/query/iterator',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Iterator.js`,
	},
	{
		module: 'N/query/page',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Page.js`,
	},
	{
		module: 'N/query/pagedData',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/pagedData.js`,
	},
	{
		module: 'N/query/pageRange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/pageRange.js`,
	},
	{
		module: 'N/query/period',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Period.js`,
	},
	{
		module: 'N/query/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Result.js`,
	},
	{
		module: 'N/query/resultSet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/ResultSet.js`,
	},
	{
		module: 'N/query/sort',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Sort.js`,
	},
	{
		module: 'N/query/suiteQL',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/SuiteQL.js`,
	},
	{
		module: 'N/https/clientCertificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/clientCertificate.js`,
	},
	{
		module: 'N/record',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/record.js`,
	},
	{
		module: 'N/record/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/RecordInstance.js`,
	},
	{
		module: 'N/record/field',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Field.js`,
	},
	{
		module: 'N/record/line',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Line.js`,
	},
	{
		module: 'N/record/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Sublist.js`,
	},
	{
		module: 'N/redirect',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/redirect/redirect.js`,
	},
	{
		module: 'N/runtime',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/runtime.js`,
	},
	{
		module: 'N/runtime/script',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/Script.js`,
	},
	{
		module: 'N/runtime/session',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/Session.js`,
	},
	{
		module: 'N/runtime/user',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/User.js`,
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
		module: 'N/search/filter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Filter.js`,
	},
	{
		module: 'N/search/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Result.js`,
	},
	{
		module: 'N/search/resultSet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/ResultSet.js`,
	},
	{
		module: 'N/search/pagedData',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPagedData.js`,
	},
	{
		module: 'N/search/pageRange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPageRange.js`,
	},
	{
		module: 'N/search/setting',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Setting.js`,
	},
	{
		module: 'N/xml',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/xml.js`,
	},
	{
		module: 'N/xml/attr',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Attr.js`,
	},
	{
		module: 'N/xml/document',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Document.js`,
	},
	{
		module: 'N/xml/element',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Element.js`,
	},
	{
		module: 'N/xml/node',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Node.js`,
	},
	{
		module: 'N/xml/parser',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Parser.js`,
	},
	{
		module: 'N/xml/xPath',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/XPath.js`,
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
