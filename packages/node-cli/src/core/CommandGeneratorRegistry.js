/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = {
	'account:manageauth': require('../commands/account/manageauth/ManageAccountCommand'),
	'account:setup': require('../commands/account/setup/SetupCommand'),
	'account:setup:ci': require('../commands/account/setupci/AccountSetupCiCommand'),
	'file:create': require('../commands/file/create/CreateFileCommand'),
	'file:import': require('../commands/file/import/ImportFilesCommand'),
	'file:list': require('../commands/file/list/ListFilesCommand'),
	'file:upload': require('../commands/file/upload/UploadFilesCommand'),
	'object:create': require('../commands/object/create/CreateObjectCommand'),
	'object:import': require('../commands/object/import/ImportObjectsCommand'),
	'object:list': require('../commands/object/list/ListObjectsCommand'),
	'object:update': require('../commands/object/update/UpdateCommand'),
	'project:adddependencies': require('../commands/project/adddependencies/AddDependenciesCommand'),
	'project:create': require('../commands/project/create/CreateProjectCommand'),
	'project:deploy': require('../commands/project/deploy/DeployCommand'),
	'project:package': require('../commands/project/package/PackageCommand'),
	'project:validate': require('../commands/project/validate/ValidateCommand'),
	'proxy:generatekey': require('../commands/proxy/generatekey/ProxyGenerateKeyCommand'),
	'proxy:start': require('../commands/proxy/start/ProxyStartCommand'),
};