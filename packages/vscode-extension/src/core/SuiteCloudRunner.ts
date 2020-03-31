import VSConsoleLogger from '../loggers/VSConsoleLogger';

const CommandActionExecutor = require('@oracle/suitecloud-cli/src/core/CommandActionExecutor');
const CommandInstanceFactory = require('@oracle/suitecloud-cli/src/core/CommandInstanceFactory');
const CommandOptionsValidator = require('@oracle/suitecloud-cli/src/core/CommandOptionsValidator');
const CLIConfigurationService = require('@oracle/suitecloud-cli/src/core/extensibility/CLIConfigurationService');
const AuthenticationService = require('@oracle/suitecloud-cli/src/core/authentication/AuthenticationService');

export default class SuiteCloudRunner {
	private commandActionExecutor: any;

	constructor(executionPath: string, commandsMetadataService: any) {
		this.commandActionExecutor = new CommandActionExecutor({
			//THIS SHOULD BE A FACTORY METHOD INSIDE THE CLI CommandActionExecutorFactory.get({executionPath:executionPath})
			executionPath,
			commandOptionsValidator: new CommandOptionsValidator(),
			cliConfigurationService: new CLIConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(executionPath),
			commandsMetadataService: commandsMetadataService,
			consoleLogger: new VSConsoleLogger(),
		});
	}

	run(options: any) {
		options.runInInteractiveMode = false;
		options.throwExceptionOnError = true;
		return this.commandActionExecutor.executeAction(options);
	}
}
