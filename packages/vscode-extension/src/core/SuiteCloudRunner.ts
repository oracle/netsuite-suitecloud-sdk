const CommandActionExecutor = require('@oracle/suitecloud-cli/src/core/CommandActionExecutor');
const CommandInstanceFactory = require('@oracle/suitecloud-cli/src/core/CommandInstanceFactory');
const CommandOptionsValidator = require('@oracle/suitecloud-cli/src/core/CommandOptionsValidator');
const CommandOutputHandler = require('@oracle/suitecloud-cli/src/core/CommandOutputHandler');
const CLIConfigurationService = require('@oracle/suitecloud-cli/src/core/extensibility/CLIConfigurationService');
const AuthenticationService = require('@oracle/suitecloud-cli/src/core/authentication/AuthenticationService');

export default class SuiteCloudRunner {
	private commandActionExecutor: any;

	constructor(executionPath: string, commandsMetadataService: any) {
		this.commandActionExecutor = new CommandActionExecutor({   //THIS SHOULD BE A FACTORY METHOD INSIDE THE CLI CommandActionExecutorFactory.get({executionPath:executionPath})
			executionPath,
			commandOutputHandler: new CommandOutputHandler(),
			commandOptionsValidator: new CommandOptionsValidator(),
			cliConfigurationService: new CLIConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(executionPath),
			commandsMetadataService: commandsMetadataService
		});
	}

	run(options: any) {
		options.runInInteractiveMode = false;
		options.throwExceptionOnError = true;
		return this.commandActionExecutor.executeAction(options);
	}
}
