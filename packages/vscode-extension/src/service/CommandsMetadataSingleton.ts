/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { CommandsMetadataService } from '../util/ExtensionUtil';

export default class CommandsMetadataSingleton {
    private static commandsMetadataService = new CommandsMetadataService();

    public static getInstance() {
      if (!this.commandsMetadataService) {
        this.commandsMetadataService = new CommandsMetadataSingleton();
      }
      return this.commandsMetadataService;
    }
}
