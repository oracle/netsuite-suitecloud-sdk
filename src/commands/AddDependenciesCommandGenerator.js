'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');

const {
	COMMAND_ADDDEPENDENCIES: { MESSAGES },
} = require('../services/TranslationKeys');

const DEPENDENCY_TYPES = {
	FEATURE: {
		name: 'FEATURE',
		prefix: 'Feature -',
	},
	FILE: {
		name: 'FILE',
		prefix: 'File -',
	},
	FOLDER: {
		name: 'FOLDER',
		prefix: 'Folder -',
	},
	OBJECT: {
		name: 'OBJECT',
		prefix: 'Object -',
	},
	PLATFORMEXTENSION: {
		name: 'PLATFORMEXTENSION',
		prefix: 'Platform Extension -',
	},
};

const FEATURE_REQUIRED = 'required';
const FEATURE_OPTIONAL = 'optional';

const APP_ID_PREFIX = 'appId=';
const BUNDLE_ID_PREFIX = 'bundleId=';
const OBJECT_TYPE_PREFIX = 'objectType=';
const SCRIPT_ID_PREFIX = 'scriptId=';

const COMMAND_OPTIONS = {
	ALL: 'all',
	PROJECT: 'project',
};

module.exports = class AddDependenciesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}
	_executeAction(answers) {
		answers[COMMAND_OPTIONS.PROJECT] = this._projectFolder;

		let flags = [];
		flags.push(COMMAND_OPTIONS.ALL);

		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			flags: flags,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
		});
	}

	_getDependenciesString(data) {
		let dependenciesString = [];
		//Features
		const features = data.filter(
			dependency => dependency.type === DEPENDENCY_TYPES.FEATURE.name
		);
		features.forEach(feature => {
			const required_or_optional = feature.required ? FEATURE_REQUIRED : FEATURE_OPTIONAL;
			dependenciesString.push(
				`${DEPENDENCY_TYPES.FEATURE.prefix} ${feature.value}:${required_or_optional}`
			);
		});

		//Files
		const files = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.FILE.name);
		files.forEach(file => {
			dependenciesString.push(`${DEPENDENCY_TYPES.FILE.prefix} ${file.value}`);
		});

		//Folders
		const folders = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.FOLDER.name);
		folders.forEach(folder => {
			dependenciesString.push(`${DEPENDENCY_TYPES.FOLDER.prefix} ${folder.value}`);
		});

		//Objects - Regular, SuiteApp,  Bundle dependencies
		const objects = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.OBJECT.name);
		objects.forEach(object => {
			const appIdDisplay = object.appId ? `${APP_ID_PREFIX}${object.appId}, ` : '';
			const bundleIdDisplay = object.bundleIds
				? `${BUNDLE_ID_PREFIX}${object.bundleIds}, `
				: '';
			const scriptIdDisplay = `${SCRIPT_ID_PREFIX}${object.scriptId}`;
			dependenciesString.push(
				`${
					DEPENDENCY_TYPES.OBJECT.prefix
				} ${appIdDisplay}${bundleIdDisplay}${scriptIdDisplay}`
			);
		});

		//Platform Extension
		const platforExtensions = data.filter(
			dependency => dependency.type === DEPENDENCY_TYPES.PLATFORMEXTENSION.name
		);
		platforExtensions.forEach(platforExtension => {
			const appIdDisplay = platforExtension.appId
				? `${APP_ID_PREFIX}${platforExtension.appId}, `
				: '';
			const objectTypeDisplay = `${OBJECT_TYPE_PREFIX}${platforExtension.objectType}`;
			dependenciesString.push(
				`${DEPENDENCY_TYPES.OBJECT.prefix} ${appIdDisplay}${objectTypeDisplay}`
			);
		});

		return dependenciesString;
	}

	_formatOutput(operationResult) {
		if (!operationResult) {
			return;
		}
		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logErrors(operationResultt);
			return;
		}

		const { data } = operationResult;
		if (data.length === 0) {
			NodeUtils.println(
				TranslationService.getMessage(
					MESSAGES.NO_UNRESOLVED_DEPENDENCIES,
					NodeUtils.COLORS.RESULT
				)
			);
			return;
		}

		NodeUtils.println(
			TranslationService.getMessage(MESSAGES.DEPENDENCIES_ADDED_TO_MANIFEST),
			NodeUtils.COLORS.RESULT
		);

		let dependenciesString = this._getDependenciesString(data);
		dependenciesString.sort().forEach(output => {
			NodeUtils.println(output, NodeUtils.COLORS.RESULT);
		});
	}
};
