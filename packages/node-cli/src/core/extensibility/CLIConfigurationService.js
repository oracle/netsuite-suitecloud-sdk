/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../../loggers/LoggerOsConstants');
const FileUtils = require('../../utils/FileUtils');
const CLIException = require('../../CLIException');
const path = require('path');
const fs = require('fs');
const NodeTranslationService = require('./../../services/NodeTranslationService');
const { ERRORS } = require('./../../services/TranslationKeys');
const CommandUserExtension = require('./CommandUserExtension');
const CLI_CONFIG_JS_FILE = 'suitecloud.config.js';
const MANIFEST_XML_FILE = 'manifest.xml';
const DEPLOY_XML_FILE = 'deploy.xml';
const DEFAULT_CONFIG = {
	defaultProjectFolder: '',
	commands: {},
};

const isString = (str) => typeof str === 'string' || str instanceof String;

module.exports = class CLIConfigurationService {
	constructor() {
		this._cliConfig = DEFAULT_CONFIG;
	}

	initialize(executionPath) {
		this._executionPath = executionPath;
		const cliConfigFile = path.join(this._executionPath, CLI_CONFIG_JS_FILE);
		if (!FileUtils.exists(cliConfigFile)) {
			return;
		}

		try {
			this._cliConfig = require(cliConfigFile);
		} catch (error) {
			throw NodeTranslationService.getMessage(ERRORS.CLI_CONFIG_ERROR_LOADING_CONFIGURATION_MODULE, cliConfigFile, lineBreak, error);
		}
	}

	getCommandUserExtension(commandName) {
		const commandExtension =
			this._cliConfig && this._cliConfig.commands && this._cliConfig.commands[commandName] ? this._cliConfig.commands[commandName] : {};
		return new CommandUserExtension(commandExtension);
	}

	getProjectFolder(command) {
		const defaultProjectFolder = isString(this._cliConfig.defaultProjectFolder) ? this._cliConfig.defaultProjectFolder : '';

		const commandConfig = this._cliConfig && this._cliConfig.commands && this._cliConfig.commands[command];
		let commandOverriddenProjectFolder;
		if (commandConfig && isString(commandConfig.projectFolder)) {
			commandOverriddenProjectFolder = commandConfig.projectFolder;
		}
		return path.join(this._executionPath, commandOverriddenProjectFolder ? commandOverriddenProjectFolder : defaultProjectFolder);
	}

	validateProjectContext(commandName) {
		if (!this._requiresSuiteCloudProject(commandName)) {
			return;
		}

		const errors = [];
		const cliConfigFilePath = path.join(this._executionPath, CLI_CONFIG_JS_FILE);
		if (!FileUtils.exists(cliConfigFilePath)) {
			errors.push(`Missing ${CLI_CONFIG_JS_FILE} in ${this._executionPath}.`);
		}

		const defaultProjectFolder = isString(this._cliConfig.defaultProjectFolder) ? this._cliConfig.defaultProjectFolder.trim() : '';
		if (!defaultProjectFolder) {
			errors.push(`Missing or invalid "defaultProjectFolder" in ${CLI_CONFIG_JS_FILE}.`);
		}

		const projectFolder = this.getProjectFolder(commandName);
		if (!FileUtils.exists(projectFolder) || !fs.statSync(projectFolder).isDirectory()) {
			errors.push(`Project folder does not exist: ${projectFolder}`);
		} else {
			const manifestPath = path.join(projectFolder, MANIFEST_XML_FILE);
			const deployPath = path.join(projectFolder, DEPLOY_XML_FILE);
			if (!FileUtils.exists(manifestPath)) {
				errors.push(`Missing ${MANIFEST_XML_FILE} in ${projectFolder}.`);
			}
			if (!FileUtils.exists(deployPath)) {
				errors.push(`Missing ${DEPLOY_XML_FILE} in ${projectFolder}.`);
			}
		}

		if (errors.length > 0) {
			const guidance = NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4737888643.html');
			const details = errors.map((entry) => ` - ${entry}`).join(lineBreak);
			throw new CLIException(`Invalid SuiteCloud project context for command "${commandName}".${lineBreak}${details}${lineBreak}${guidance}`);
		}
	}

	_requiresSuiteCloudProject(commandName) {
		if (!commandName || commandName === 'project:create') {
			return false;
		}
		return commandName.startsWith('project:') || commandName.startsWith('file:') || commandName.startsWith('object:');
	}
};
