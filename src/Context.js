const FileUtils = require('./utils/FileUtils');
const path = require('path');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const { ACCOUNT_DETAILS_FILENAME, SDF_SDK_PATHNAME } = require('./ApplicationConstants');

const DEFAULT_ACCOUNT = 'default';
const DEFAULT_ACCOUNT_PROPERTIES_KEYS = ['netsuiteUrl', 'accountId', 'accountName', 'roleId', 'roleName', 'email'];


class AccountDetails {
	constructor() {
		this._isAccountSetup = false;
	}

	initializeFromFile(file, accountToLoad = DEFAULT_ACCOUNT) {
		if (FileUtils.exists(file)) {
			const fileContentJson = FileUtils.readAsJson(file);
			this._validateAccountDetailsFileStructure(fileContentJson, accountToLoad);
			this.initializeFromObj(fileContentJson[accountToLoad]);
		}
	}

	_validateAccountDetailsFileStructure(fileContent, accountToLoad) {
		if (!fileContent.hasOwnProperty(accountToLoad)) {
			throw TranslationService.getMessage(
				ERRORS.ACCOUNT_DETAILS_FILE_CONTENT,
				ACCOUNT_DETAILS_FILENAME
			);
		}
		DEFAULT_ACCOUNT_PROPERTIES_KEYS.forEach(accountPropertyKey => {
			if (!fileContent[accountToLoad].hasOwnProperty(accountPropertyKey)) {
				throw TranslationService.getMessage(
					ERRORS.ACCOUNT_DETAILS_FILE_CONTENT,
					ACCOUNT_DETAILS_FILENAME
				);
			}
		});
	}

	initializeFromObj(obj) {
		this._netsuiteUrl = obj.netsuiteUrl;
		this._accountId = obj.accountId;
		this._accountName = obj.accountName;
		this._email = obj.email;
		this._roleId = obj.roleId;
		this._roleName = obj._roleName;
		this._password = obj.password;
		this._isAccountSetup = true;
	}

	getEmail() {
		return this._email;
	}

	getPassword() {
		return this._password;
	}

	getRoleId() {
		return this._roleId;
	}

	getRoleName() {
		return this._roleName;
	}

	getAccountId() {
		return this._accountId;
	}

	getAccountName() {
		return this._accountName;
	}

	getNetSuiteUrl() {
		return this._netsuiteUrl;
	}

	isAccountSetup() {
		return this._isAccountSetup;
	}
}

var accountDetails = new AccountDetails();
accountDetails.initializeFromFile(ACCOUNT_DETAILS_FILENAME);

module.exports = {
	SDKFilePath: path.join(__dirname, SDF_SDK_PATHNAME),
	CurrentAccountDetails: accountDetails,
};
