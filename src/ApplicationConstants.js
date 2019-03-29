const PACKAGE_WORD = "[a-z0-9]+";
module.exports = {
	SDK_COMMANDS_METADATA_FILE: 'SDKCommandsMetadata.json',
	NODE_COMMANDS_METADATA_FILE: 'NodeCommandsMetadata.json',
	COMMAND_GENERATORS_METADATA_FILE: 'CommandGenerators.json',
	ACCOUNT_DETAILS_FILENAME: 'account.json',
	SDF_SDK_PATHNAME: '../bin/cli-2019.1.0.jar',
	CLI_EXCEPTION_EVENT: 'CLIExceptionEvent',
	CLI_FATAL_EXCEPTION_EVENT: 'CLIFatalExceptionEvent',
	CLI_DEFAULT_ERROR_EVENT: 'error',
	AUTHENTICATION_MODE_BASIC: 'BASIC',
	AUTHENTICATION_MODE_TBA: 'TBA',
	DEFAULT_MESSAGES_FILE: '../../messages.json',
	MANIFEST_XML: 'manifest.xml',
	PACKAGE_REGEX: "^" + PACKAGE_WORD + "(\\." + PACKAGE_WORD + "){2}$",
	PROJECT_ACP: 'ACCOUNTCUSTOMIZATION',
	PROJECT_SUITEAPP: 'SUITEAPP',
	XML: {
		ATTRIBUTES: {
			PROJECT_TYPE: 'projecttype',
		},
		TAGS: {
			MANIFEST: 'manifest',
			
		}
	},
};
