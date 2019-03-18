'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const ApplicationConstants = require('../ApplicationConstants');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const CryptoUtils = require('../utils/CryptoUtils');
const Context = require('../Context');
const CLIException = require('../CLIException');

const ISSUE_TOKEN_COMMAND = 'issuetoken';
const REVOKE_TOKEN_COMMAND = 'revoketoken';

const MANIFEST_XML = 'manifest.xml';

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_getCommandQuestions(prompt) {
		return prompt([
			{
				type: 'list',
				name: 'environment',
				message: 'Choose the NS environment',
				default: 0,
				choices: [
					{
						name: 'Production',
						value: 'system.netsuite.com',
					},
					{
						name: 'Sandbox',
						value: 'system.sandbox.netsuite.com',
					},
				],
			},
			{
				type: 'input',
				name: 'email',
				message: 'Please enter your email',
			},
			{
				type: 'password',
				name: 'password',
				message: 'Please enter your account password',
			},
			{
				type: 'list',
				name: 'authenticationMode',
				message: 'Choose the NS authentication',
				default: ApplicationConstants.AUTHENTICATION_MODE_TBA,
				choices: [
					{
						name: 'Basic',
						value: ApplicationConstants.AUTHENTICATION_MODE_BASIC,
					},
					{
						name: 'Token-based Authentication',
						value: ApplicationConstants.AUTHENTICATION_MODE_TBA,
					},
				],
			},
			{
				type: 'text',
				name: 'account',
                message: 'Enter the Company ID (compId)',
            },
            {
                type: 'text',
                name: 'role',
                default: 3,
                message: 'Enter the Role ID',
			},
		]);
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw new CLIException(
				0,
				`Please run setupaccount in a valid folder. Could not find a ${MANIFEST_XML} file in the project folder ${this._projectFolder}`
			);
		}
	}

	_setupAuthentication(contextValues) {
		return new Promise((resolve, reject) => {
			if (contextValues.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_TBA) {
				this._issueToken()
					.then(() => resolve())
					.catch(error => {
						reject(`Error issuing token: ${error}`);
					});
			} else if (
				contextValues.authenticationMode ===
					ApplicationConstants.AUTHENTICATION_MODE_BASIC &&
				FileUtils.exists(ApplicationConstants.ACCOUNT_DETAILS_FILENAME)
			) {
				const accountContext = FileUtils.readAsJson(
					ApplicationConstants.ACCOUNT_DETAILS_FILENAME
				);
				if (
					accountContext.authenticationMode ===
					ApplicationConstants.AUTHENTICATION_MODE_TBA
				) {
					this._revokeToken()
						.then(() => resolve())
						.catch(error => {
							reject(`Error revoking old token: ${error}`);
						});
				}
			} else {
				resolve();
			}
		});
	}

	_issueToken() {
		let executionContext = new SDKExecutionContext({
			command: ISSUE_TOKEN_COMMAND,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContext);
		return this._sdkExecutor.execute(executionContext);
	}

	_revokeToken() {
		let executionContext = new SDKExecutionContext({
			command: REVOKE_TOKEN_COMMAND,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContext);
		return this._sdkExecutor.execute(executionContext);
	}

	_createAccountDetailsFile(contextValues) {
		FileUtils.create(ApplicationConstants.ACCOUNT_DETAILS_FILENAME, contextValues);
	}

	_executeAction(answers) {
		return new Promise((resolve, reject) => {
			try {
				this._checkWorkingDirectoryContainsValidProject();
				var encryptionKey = CryptoUtils.generateRandomKey();
				var contextValues = {
					netsuiteUrl: answers.environment,
					compId: answers.account,
					email: answers.email,
					password: CryptoUtils.encrypt(answers.password, encryptionKey),
					roleId: answers.role,
					authenticationMode: answers.authenticationMode,
					encryptionKey: encryptionKey,
				};
				Context.CurrentAccountDetails.initializeFromObj(contextValues);

				this._setupAuthentication(contextValues)
					.then(() => {
						try {
							this._createAccountDetailsFile(contextValues);
							NodeUtils.println('Context setup correctly', NodeUtils.COLORS.GREEN);
							resolve();
						} catch (error) {
							reject('Error while setting up context');
						}
					})
					.catch(error => reject(error));
			} catch (error) {
				reject(error);
			}
		});
	}
};
