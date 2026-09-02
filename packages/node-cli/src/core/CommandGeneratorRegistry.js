/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Keep command imports statically visible to webpack without eagerly loading every
// command (some commands initialize ESM-only or raw-template dependencies).
const lazy = (loadCommand) => ({
	create: (...args) => loadCommand().create(...args),
});

module.exports = {
	'account:manageauth': lazy(() => require('../commands/account/manageauth/ManageAccountCommand')),
	'account:setup': lazy(() => require('../commands/account/setup/SetupCommand')),
	'account:setup:ci': lazy(() => require('../commands/account/setupci/AccountSetupCiCommand')),
	'config:import': lazy(() => require('../commands/config/import/ImportConfigurationCommand')),
	'file:create': lazy(() => require('../commands/file/create/CreateFileCommand')),
	'file:import': lazy(() => require('../commands/file/import/ImportFilesCommand')),
	'file:list': lazy(() => require('../commands/file/list/ListFilesCommand')),
	'file:upload': lazy(() => require('../commands/file/upload/UploadFilesCommand')),
	'object:create': lazy(() => require('../commands/object/create/CreateObjectCommand')),
	'object:import': lazy(() => require('../commands/object/import/ImportObjectsCommand')),
	'object:list': lazy(() => require('../commands/object/list/ListObjectsCommand')),
	'object:update': lazy(() => require('../commands/object/update/UpdateCommand')),
	'project:adddependencies': lazy(() => require('../commands/project/adddependencies/AddDependenciesCommand')),
	'project:create': lazy(() => require('../commands/project/create/CreateProjectCommand')),
	'project:deploy': lazy(() => require('../commands/project/deploy/DeployCommand')),
	'project:package': lazy(() => require('../commands/project/package/PackageCommand')),
	'project:validate': lazy(() => require('../commands/project/validate/ValidateCommand')),
	'proxy:generatekey': lazy(() => require('../commands/proxy/generatekey/ProxyGenerateKeyCommand')),
	'proxy:start': lazy(() => require('../commands/proxy/start/ProxyStartCommand')),
};
