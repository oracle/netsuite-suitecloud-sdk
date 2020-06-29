const NodeTranslationService = require('./../services/NodeTranslationService');
const { ERRORS } = require('../services/TranslationKeys');

const SUITECLOUD_COMMANDS = {
	ACCOUNT_CI: 'account:ci',
	ACCOUNT_MANAGEAUTH: 'account:manageauth',
	ACCOUNT_SETUP: 'account:setup',
	CONFIG_PROXY: 'config:proxy',
	FILE_IMPORT: 'file:import',
	FILE_LIST: 'file:list',
	FILE_UPLOAD: 'file:upload',
	OBJECT_IMPORT: 'object:import',
	OBJECT_LIST: 'object:list',
	OBJECT_UPDATE: 'object:update',
	PROJECT_ADDDEPENDENCIES: 'project:adddependencies',
	PROJECT_CREATE: 'project:create',
	PROJECT_DEPLOY: 'project:deploy',
	PROJECT_PACKAGE: 'project:package',
	PROJECT_VALIDATE: 'projecT:validate',
	SUITECOMMERCE_LOCALSERVER: 'suitecommerce:localserver',
};

module.exports = {
	getSuiteCloudCommand(name) {
		switch (name) {
			case SUITECLOUD_COMMANDS.ACCOUNT_CI:
				return require('../commands/account/ci/AccountCiCommand');
			case SUITECLOUD_COMMANDS.ACCOUNT_MANAGEAUTH:
				return require('../commands/account/manageauth/ManageAccountCommand');
			case SUITECLOUD_COMMANDS.ACCOUNT_SETUP:
				return require('../commands/account/setup/SetupCommand');
			case SUITECLOUD_COMMANDS.CONFIG_PROXY:
				return require('../commands/config/proxy/ProxyCommand');
			case SUITECLOUD_COMMANDS.FILE_IMPORT:
				return require('../commands/file/import/ImportFilesCommand');
			case SUITECLOUD_COMMANDS.FILE_UPLOAD:
				return require('../commands/file/upload/UploadFilesCommand');
			case SUITECLOUD_COMMANDS.FILE_UPLOAD:
				return require('../commands/file/upload/UploadFilesCommand');
			case SUITECLOUD_COMMANDS.OBJECT_IMPORT:
				return require('../commands/object/import/ImportObjectsCommand');
			case SUITECLOUD_COMMANDS.OBJECT_LIST:
				return require('../commands/object/list/ListObjectsCommand');
			case SUITECLOUD_COMMANDS.OBJECT_UPDATE:
				return require('../commands/object/update/UpdateCommand');
			case SUITECLOUD_COMMANDS.PROJECT_ADDDEPENDENCIES:
				return require('../commands/project/adddependencies/AddDependenciesCommand');
			case SUITECLOUD_COMMANDS.PROJECT_CREATE:
				return require('../commands/project/create/CreateProjectCommand');
			case SUITECLOUD_COMMANDS.PROJECT_DEPLOY:
				return require('../commands/project/deploy/DeployCommand');
			case SUITECLOUD_COMMANDS.PROJECT_PACKAGE:
				return require('../commands/project/package/PackageCommand');
			case SUITECLOUD_COMMANDS.PROJECT_VALIDATE:
				return require('../commands/project/validate/ValidateCommand');
			case SUITECLOUD_COMMANDS.SUITECOMMERCE_LOCALSERVER:
				return require('../commands/suitecommerce/localserver/LocalServerCommand');
			default:
				throw NodeTranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_EXIST, name);
		}
	},
};
