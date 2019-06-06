const FileUtils = require('./utils/FileUtils');
const path = require('path');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const { ACCOUNT_DETAILS_FILENAME, SDF_SDK_PATHNAME } = require('./ApplicationConstants');

const DEFAULT_ACCOUNT = 'default';

const DEFAULT_ACCOUNT_FILE_STRUCUTRE = {
	default: {
		netsuiteUrl: 'system.netsuite.com',
		compId: '12345678',
		email: 'example@email.com',
		roleId: 3,
		authenticationMode: 'TBA',
	},
};

class AccountDetails {
	constructor() {
		this._isAccountSetup = false;
	}

	initializeFromFile(file, accountName = DEFAULT_ACCOUNT) {
		if (FileUtils.exists(file)) {
			var fileContentJson = FileUtils.readAsJson(file);
			if (!fileContentJson.hasOwnProperty(accountName)) {
				throw TranslationService.getMessage(
					ERRORS.ACCOUNT_DETAILS_FILE_CONTENT,
					ACCOUNT_DETAILS_FILENAME
				);
			}
			Object.keys(DEFAULT_ACCOUNT_FILE_STRUCUTRE.default).forEach(accountPropertyKey => {
				if (!fileContentJson[accountName].hasOwnProperty(accountPropertyKey)) {
					throw TranslationService.getMessage(
						ERRORS.ACCOUNT_DETAILS_FILE_CONTENT,
						ACCOUNT_DETAILS_FILENAME
					);
				}
			});
			this.initializeFromObj(fileContentJson[accountName]);
		}
	}

	initializeFromObj(obj) {
		this._netsuiteUrl = obj.netsuiteUrl;
		this._compId = obj.compId;
		this._email = obj.email;
		this._roleId = obj.roleId;
		this._authenticationMode = obj.authenticationMode;
		this._isAccountSetup = true;
	}

	getEmail() {
		return this._email;
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

	getAuthenticationMode() {
		return this._authenticationMode;
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
