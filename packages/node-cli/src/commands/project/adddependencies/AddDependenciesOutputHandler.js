/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const {
	COMMAND_ADDDEPENDENCIES: { MESSAGES },
} = require('../../../services/TranslationKeys');

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

module.exports = class AddDependenciesOutputFormatter extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (actionResult.data.length === 0) {
			this._log.result(NodeTranslationService.getMessage(MESSAGES.NO_UNRESOLVED_DEPENDENCIES));
			return actionResult;
		}

		this._log.result(NodeTranslationService.getMessage(MESSAGES.DEPENDENCIES_ADDED_TO_MANIFEST));

		this._getDependenciesStringsArray(actionResult.data)
			.sort()
			.forEach((output) => this._log.result(output));
		return actionResult;
	}

	_getDependenciesStringsArray(data) {
		const dependenciesString = [];
		//Features
		const features = data.filter((dependency) => dependency.type === DEPENDENCY_TYPES.FEATURE.name);
		features.forEach((feature) => {
			const requiredOrOptional = feature.required ? FEATURE_REQUIRED : FEATURE_OPTIONAL;
			dependenciesString.push(`${DEPENDENCY_TYPES.FEATURE.prefix} ${feature.value}:${requiredOrOptional}`);
		});

		//Files
		const files = data.filter((dependency) => dependency.type === DEPENDENCY_TYPES.FILE.name);
		files.forEach((file) => {
			dependenciesString.push(`${DEPENDENCY_TYPES.FILE.prefix} ${file.value}`);
		});

		//Folders
		const folders = data.filter((dependency) => dependency.type === DEPENDENCY_TYPES.FOLDER.name);
		folders.forEach((folder) => {
			dependenciesString.push(`${DEPENDENCY_TYPES.FOLDER.prefix} ${folder.value}`);
		});

		//Objects - Regular, SuiteApp,  Bundle dependencies
		const objects = data.filter((dependency) => dependency.type === DEPENDENCY_TYPES.OBJECT.name);
		objects.forEach((object) => {
			const appIdDisplay = object.appId
				? `in [${OBJECT_CONTAINER_PREFIX.SUITEAPP} - ${OBJECT_REFERENCE_ATTRIBUTES.APP_ID}${object.appId}]`
				: '';
			const bundleIdDisplay = object.bundleIds
				? `in [${OBJECT_CONTAINER_PREFIX.BUNDLE} - ${OBJECT_REFERENCE_ATTRIBUTES.BUNDLE_ID}${object.bundleIds}]`
				: '';
			const scriptIdDisplay = `${OBJECT_REFERENCE_ATTRIBUTES.SCRIPT_ID}${object.scriptId}`;
			dependenciesString.push(`[${DEPENDENCY_TYPES.OBJECT.prefix} ${scriptIdDisplay}] ${appIdDisplay}${bundleIdDisplay}`);
		});

		//Platform Extensions
		const platformExtensions = data.filter((dependency) => dependency.type === DEPENDENCY_TYPES.PLATFORMEXTENSION.name);
		platformExtensions.forEach((platformExtension) => {
			const appIdDisplay = platformExtension.appId ? `${OBJECT_REFERENCE_ATTRIBUTES.APP_ID}${platformExtension.appId}, ` : '';
			const objectTypeDisplay = `${OBJECT_REFERENCE_ATTRIBUTES.OBJECT_TYPE}${platformExtension.objectType}`;
			dependenciesString.push(`${DEPENDENCY_TYPES.PLATFORMEXTENSION.prefix} ${appIdDisplay}${objectTypeDisplay}`);
		});

		return dependenciesString;
	}
};
