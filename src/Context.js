const FileUtils = require('./utils/FileUtils');
const path = require('path');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const { ACCOUNT_DETAILS_FILENAME, SDF_SDK_PATHNAME } = require('./ApplicationConstants');

const DEFAULT_ACCOUNT = 'default';
const DEFAULT_ACCOUNT_PROPERTIES_KEYS = ['netsuiteUrl', 'compId', 'email', 'roleId'];

class AccountDetails {
	constructor() {
		this._isAccountSetup = false;
	}

	initializeFromFile(file, accountName = DEFAULT_ACCOUNT) {
		if (FileUtils.exists(file)) {
			const fileContentJson = FileUtils.readAsJson(file);
			if(this._validateAccountDetailsFileStructure(fileContentJson, accountName)) {
				this.initializeFromObj(fileContentJson[accountName]);
			}
		}
	}

	_validateAccountDetailsFileStructure(fileContent, accountName) {
		if (!fileContent.hasOwnProperty(accountName)) {
			throw TranslationService.getMessage(
				ERRORS.ACCOUNT_DETAILS_FILE_CONTENT,
				ACCOUNT_DETAILS_FILENAME
			);
		}
		DEFAULT_ACCOUNT_PROPERTIES_KEYS.forEach(accountPropertyKey => {
			if (!fileContent[accountName].hasOwnProperty(accountPropertyKey)) {
				throw TranslationService.getMessage(
					ERRORS.ACCOUNT_DETAILS_FILE_CONTENT,
					ACCOUNT_DETAILS_FILENAME
				);
			}
		});
		return true;
	}

	initializeFromObj(obj) {
		this._netsuiteUrl = obj.netsuiteUrl;
		this._compId = obj.compId;
		this._email = obj.email;
		this._roleId = obj.roleId;
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

	getCompId() {
		return this._compId;
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
