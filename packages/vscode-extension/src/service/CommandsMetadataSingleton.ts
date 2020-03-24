const CliCommandsMetadataService = require('@oracle/suitecloud-cli/src/core/CommandsMetadataService');
import { dirname } from 'path';

export default class CommandsMetadataSingleton {
    private commandsMetadataServiceSingelton : any;
    private static instance : CommandsMetadataSingleton;

    private constructor() {
      const suitecloudNodeJsSourcePath: string = dirname(require.resolve('@oracle/suitecloud-cli'));
	    this.commandsMetadataServiceSingelton = new CliCommandsMetadataService(suitecloudNodeJsSourcePath);
	    this.commandsMetadataServiceSingelton.initializeCommandsMetadata();
    }

    public static getInstance(): CommandsMetadataSingleton {
        if (!this.instance) {
          this.instance = new CommandsMetadataSingleton();
        }
        return this.instance;
      }

    public getMetadata() : any {
        return this.commandsMetadataServiceSingelton;
    }
}


