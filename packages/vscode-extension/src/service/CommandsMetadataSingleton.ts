const CliCommandsMetadataService = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandsMetadataService');

export default class CommandsMetadataSingelton {
    private _commandsMetadataServiceSingelton : any;
    private static instance : CommandsMetadataSingelton;

    private constructor() {
      const suitecloudNodeJsSourcePath: string = require.resolve('@oracle/netsuite-suitecloud-nodejs-cli').split('\\suitecloud.js')[0];
	    this._commandsMetadataServiceSingelton = new CliCommandsMetadataService(suitecloudNodeJsSourcePath);
	    this._commandsMetadataServiceSingelton.initializeCommandsMetadata();
    }

    public static getInstance(): CommandsMetadataSingelton {
        if (!this.instance) {
          this.instance = new CommandsMetadataSingelton();
        }
        return this.instance;
      }

    public getMetadata() : any {
        return this._commandsMetadataServiceSingelton;
    }
}


