/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export type CommandInfo = {
	vscodeCommandId: string;
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
	importobjects: CommandInfo;
	listfiles: CommandInfo;
	listobjects: CommandInfo;
	setupaccount: CommandInfo;
	updatefile: CommandInfo;
	updateobject: CommandInfo;
	uploadfile: CommandInfo;
};

export const commandsInfoMap: CommandsInfoMapType = {
	adddependencies: {
		vscodeCommandId: 'suitecloud.adddependencies',
		cliCommandName: 'project:adddependencies',
		vscodeCommandName: 'Add Dependency References to the Manifest',
		vscodeShortName: 'Add Dependencies',
	},
	createfile: {
		vscodeCommandId: 'suitecloud.createfile',
		cliCommandName: 'file:create',
		vscodeCommandName: 'Create SuiteScript File',
	},
	createproject: {
		vscodeCommandId: 'suitecloud.createproject',
		cliCommandName: 'project:create',
		vscodeCommandName: 'Create SuiteCloud Project...',
		vscodeShortName: 'Create Project',
	},
	deploy: {
		vscodeCommandId: 'suitecloud.deploy',
		cliCommandName: 'project:deploy',
		vscodeCommandName: 'Deploy Project...',
		vscodeShortName: 'Deploy',
	},
	importfiles: {
		vscodeCommandId: 'suitecloud.importfiles',
		cliCommandName: 'file:import',
		vscodeCommandName: 'Import Files',
	},
	importobjects: {
		vscodeCommandId: 'suitecloud.importobjects',
		cliCommandName: 'object:import',
		vscodeCommandName: 'Import Objects',
	},
	listfiles: {
		vscodeCommandId: 'suitecloud.listfiles',
		cliCommandName: 'file:list',
		vscodeCommandName: 'List Files',
	},
	listobjects: {
		vscodeCommandId: 'suitecloud.listobjects',
		cliCommandName: 'object:list',
		vscodeCommandName: 'List Objects...',
	},
	setupaccount: {
		vscodeCommandId: 'suitecloud.setupaccount',
		cliCommandName: 'account:setup',
		vscodeCommandName: 'Set Up Account...',
	},
	updatefile: {
		vscodeCommandId: 'suitecloud.updatefile',
		cliCommandName: 'file:import',
		vscodeCommandName: 'Update File from Account',
	},
	updateobject: {
		vscodeCommandId: 'suitecloud.updateobject',
		cliCommandName: 'object:update',
		vscodeCommandName: 'Update Object from Account',
		vscodeShortName: 'Update Object',
	},
	uploadfile: {
		vscodeCommandId: 'suitecloud.uploadfile',
		cliCommandName: 'file:upload',
		vscodeCommandName: 'Upload File',
	},
};
