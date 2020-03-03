const CliCommandsMetadataService = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandsMetadataService');

export default class CommandsMetadataSingelton {
    private commandsMetadataServiceSingelton : any;
    private static instance : CommandsMetadataSingelton;

    private constructor() {
      const suitecloudNodeJsSourcePath: string = require.resolve('@oracle/netsuite-suitecloud-nodejs-cli').split('\\suitecloud.js')[0];
	    this.commandsMetadataServiceSingelton = new CliCommandsMetadataService(suitecloudNodeJsSourcePath);
	    this.commandsMetadataServiceSingelton.initializeCommandsMetadata();
    }

    public static getInstance(): CommandsMetadataSingelton {
        if (!this.instance) {
          this.instance = new CommandsMetadataSingelton();
        }
        return this.instance;
      }

    public getMetadata() : any {
        return this.commandsMetadataServiceSingelton;
    }
}


