const FileUtils = require('../../utils/FileUtils');
const TranslationService = require('../../services/TranslationService');
const AccountDetails = require('./AccountDetails');
const { ERRORS } = require('../../services/TranslationKeys');
const { ACCOUNT_DETAILS_FILENAME } = require('../../ApplicationConstants');
const assert = require('assert');

const DEFAULT_ACCOUNT = 'default';
const DEFAULT_ACCOUNT_PROPERTIES_KEYS = [
	'netsuiteUrl',
	'accountId',
	'accountName',
	'roleId',
	'roleName',
	'email',
];

let CACHED_ACCOUNT_DETAILS;
module.exports = class AccountDetailsService {
	get(accountToLoad = DEFAULT_ACCOUNT) {
		//accountToLoad will be different when enable multi-account account.json configurations
		if (!CACHED_ACCOUNT_DETAILS) {
			const accountDetails = this._lazyLoadAccountDetails(accountToLoad);
			this.set(accountDetails);
		}

		return CACHED_ACCOUNT_DETAILS;
	}

	set(accountDetails) {
		CACHED_ACCOUNT_DETAILS = accountDetails;
	}

	save(accountDetails) {
		assert(accountDetails);
		this.set(accountDetails);
		this.saveCached();
	}

	saveCached() {
		assert(CACHED_ACCOUNT_DETAILS);
		try {
			// nest the values into a 'default' property
			const defaultAccountDetails = {
				default: CACHED_ACCOUNT_DETAILS.toJSONWithoutPassword(),
			};
			FileUtils.create(ACCOUNT_DETAILS_FILENAME, defaultAccountDetails);
		} catch (error) {
			throw TranslationService.getMessage(ERRORS.WRITING_ACCOUNT_JSON);
		}
	}

	_lazyLoadAccountDetails(accountToLoad) {
		if (FileUtils.exists(ACCOUNT_DETAILS_FILENAME)) {
			const fileContentJson = FileUtils.readAsJson(ACCOUNT_DETAILS_FILENAME);
			this._validateAccountDetailsFileStructure(fileContentJson, accountToLoad);
			return AccountDetails.fromJson(fileContentJson[accountToLoad]);
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
};
