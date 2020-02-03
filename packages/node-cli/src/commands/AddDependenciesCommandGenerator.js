/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const CommandUtils = require('../utils/CommandUtils');

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

const OBJECT_REFERENCE_ATTRIBUTES = {
	APP_ID: 'appId=',
	BUNDLE_ID: 'bundleId=',
	OBJECT_TYPE: 'objectType=',
	SCRIPT_ID: 'scriptId=',
};

const OBJECT_CONTAINER_PREFIX = {
	BUNDLE: 'Bundle',
	SUITEAPP: 'Application',
};

const COMMAND_OPTIONS = {
	ALL: 'all',
	PROJECT: 'project',
};

module.exports = class AddDependenciesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_preExecuteAction(answers) {
		answers[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		return answers;
	}

	_executeAction(answers) {
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			flags: [COMMAND_OPTIONS.ALL],
			requiresContextParams: true
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
		});
	}

	_supportsInteractiveMode() {
		return false;
	}

	_getDependenciesStringsArray(data) {
		const dependenciesString = [];
		//Features
		const features = data.filter(
			dependency => dependency.type === DEPENDENCY_TYPES.FEATURE.name
		);
		features.forEach(feature => {
			const requiredOrOptional = feature.required ? FEATURE_REQUIRED : FEATURE_OPTIONAL;
			dependenciesString.push(
				`${DEPENDENCY_TYPES.FEATURE.prefix} ${feature.value}:${requiredOrOptional}`
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
			const appIdDisplay = object.appId
				? `in [${OBJECT_CONTAINER_PREFIX.SUITEAPP} - ${OBJECT_REFERENCE_ATTRIBUTES.APP_ID}${
						object.appId
				  }]`
				: '';
			const bundleIdDisplay = object.bundleIds
				? `in [${OBJECT_CONTAINER_PREFIX.BUNDLE} - ${
						OBJECT_REFERENCE_ATTRIBUTES.BUNDLE_ID
				  }${object.bundleIds}]`
				: '';
			const scriptIdDisplay = `${OBJECT_REFERENCE_ATTRIBUTES.SCRIPT_ID}${object.scriptId}`;
			dependenciesString.push(
				`[${
					DEPENDENCY_TYPES.OBJECT.prefix
				} ${scriptIdDisplay}] ${appIdDisplay}${bundleIdDisplay}`
			);
		});

		//Platform Extensions
		const platforExtensions = data.filter(
			dependency => dependency.type === DEPENDENCY_TYPES.PLATFORMEXTENSION.name
		);
		platforExtensions.forEach(platforExtension => {
			const appIdDisplay = platforExtension.appId
				? `${OBJECT_REFERENCE_ATTRIBUTES.APP_ID}${platforExtension.appId}, `
				: '';
			const objectTypeDisplay = `${OBJECT_REFERENCE_ATTRIBUTES.OBJECT_TYPE}${
				platforExtension.objectType
			}`;
			dependenciesString.push(
				`${DEPENDENCY_TYPES.PLATFORMEXTENSION.prefix} ${appIdDisplay}${objectTypeDisplay}`
			);
		});

		return dependenciesString;
	}

	_formatOutput(operationResult) {
		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logResultMessage(operationResult);
			SDKOperationResultUtils.logErrors(operationResult);
			return;
		}

		const { data } = operationResult;
		if (data.length === 0) {
			NodeUtils.println(
				TranslationService.getMessage(MESSAGES.NO_UNRESOLVED_DEPENDENCIES),
				NodeUtils.COLORS.RESULT
			);
			return;
		}

		NodeUtils.println(
			TranslationService.getMessage(MESSAGES.DEPENDENCIES_ADDED_TO_MANIFEST),
			NodeUtils.COLORS.RESULT
		);

		this._getDependenciesStringsArray(data)
			.sort()
			.forEach(output => NodeUtils.println(output, NodeUtils.COLORS.RESULT));
	}
};
