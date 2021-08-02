/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export type CommandInfo = {
	vscodeContributedCommand: string;
	cliCommandName: string;
	vscodeCommandName: string;
	// not really needed, just left here as an idea
	vscodeShortName?: string;
};

export type CommandsInfoMapType = {
	adddependencies: CommandInfo;
	createfile: CommandInfo;
	createproject: CommandInfo;
	deploy: CommandInfo;
	importfiles: CommandInfo;
	importfile: CommandInfo;
	importobjects: CommandInfo;
	listfiles: CommandInfo;
	listobjects: CommandInfo;
	setupaccount: CommandInfo;
	updateobject: CommandInfo;
	uploadfile: CommandInfo;
};

export const commandsInfoMap: CommandsInfoMapType = {
	adddependencies: {
		vscodeContributedCommand: 'suitecloud.adddependencies',
		cliCommandName: 'project:adddependencies',
		vscodeCommandName: 'Add Dependency References to the Manifest',
		vscodeShortName: 'Add Dependencies',
	},
	createfile: {
		vscodeContributedCommand: 'suitecloud.createfile',
		cliCommandName: 'file:create',
		vscodeCommandName: 'Create SuiteScript File',
	},
	createproject: {
		vscodeContributedCommand: 'suitecloud.createproject',
		cliCommandName: 'project:create',
		vscodeCommandName: 'Create SuiteCloud Project...',
		vscodeShortName: 'Create Project',
	},
	deploy: {
		vscodeContributedCommand: 'suitecloud.deploy',
		cliCommandName: 'project:deploy',
		vscodeCommandName: 'Deploy Project...',
		vscodeShortName: 'Deploy',
	},
	importfiles: {
		vscodeContributedCommand: 'suitecloud.importfiles',
		cliCommandName: 'file:import',
		vscodeCommandName: 'Import Files',
	},
	importfile: {
		vscodeContributedCommand: 'suitecloud.importfile',
		cliCommandName: 'file:import',
		vscodeCommandName: 'Import File',
	},
	importobjects: {
		vscodeContributedCommand: 'suitecloud.importobjects',
		cliCommandName: 'object:import',
		vscodeCommandName: 'Import Objects',
	},
	listfiles: {
		vscodeContributedCommand: 'suitecloud.listfiles',
		cliCommandName: 'file:list',
		vscodeCommandName: 'List Files',
	},
	listobjects: {
		vscodeContributedCommand: 'suitecloud.listobjects',
		cliCommandName: 'object:list',
		vscodeCommandName: 'List Objects...',
	},
	setupaccount: {
		vscodeContributedCommand: 'suitecloud.setupaccount',
		cliCommandName: 'account:setup',
		vscodeCommandName: 'Set Up Account...',
	},
	updateobject: {
		vscodeContributedCommand: 'suitecloud.updateobject',
		cliCommandName: 'object:update',
		vscodeCommandName: 'Update Single Object with Account Object',
		vscodeShortName: 'Update Object',
	},
	uploadfile: {
		vscodeContributedCommand: 'suitecloud.uploadfile',
		cliCommandName: 'file:upload',
		vscodeCommandName: 'Upload File',
	},
};
