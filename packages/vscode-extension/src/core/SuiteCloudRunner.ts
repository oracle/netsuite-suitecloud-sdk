const CommandActionExecutor = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandActionExecutor');
const CommandInstanceFactory = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandInstanceFactory');
const CommandOptionsValidator = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandOptionsValidator');
const CommandOutputHandler = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandOutputHandler');
const CLIConfigurationService = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/extensibility/CLIConfigurationService');
const AuthenticationService = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/authentication/AuthenticationService');

export default class SuiteCloudCLIRunner {
	_commandActionExecutor: any;
	_commandsMetadataService: any;

	constructor(executionPath: string, commandsMetadataService: any) { 
		this._commandActionExecutor = new CommandActionExecutor({
			executionPath,
			commandOutputHandler: new CommandOutputHandler(),
			commandOptionsValidator: new CommandOptionsValidator(),
			cliConfigurationService: new CLIConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(executionPath),
			commandsMetadataService: commandsMetadataService,
		});
	}

	run(options: any) {
		return this._commandActionExecutor.executeAction(options);
	}
}