/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export type CommandInfo = {
	vscodeCommandId: string;
	vscodeCommandName: string;
	// not really needed, just left here as an idea
	vscodeShortName?: string;
};

export type CliCommandInfo = CommandInfo & {
	cliCommandName: string;
};

export type CliCommandsInfoMapType = {
	adddependencies: CliCommandInfo;
	comparefile: CliCommandInfo;
	createfile: CliCommandInfo;
	createproject: CliCommandInfo;
	deploy: CliCommandInfo;
	importfiles: CliCommandInfo;
	importobjects: CliCommandInfo;
	listfiles: CliCommandInfo;
	listobjects: CliCommandInfo;
	manageauth: CliCommandInfo;
	setupaccount: CliCommandInfo;
	updatefile: CliCommandInfo;
	updateobject: CliCommandInfo;
	uploadfile: CliCommandInfo;
	validate: CliCommandInfo;
};

export type CommandsInfoMapType = CliCommandsInfoMapType & {
	opencontrolpanel: CommandInfo;
	opendevassistfeedbackform: CommandInfo;
};

export const commandsInfoMap: CommandsInfoMapType = {
	adddependencies: {
		vscodeCommandId: 'suitecloud.adddependencies',
		cliCommandName: 'project:adddependencies',
		vscodeCommandName: 'Add Dependency References to the Manifest',
		vscodeShortName: 'Add Dependencies',
	},
	comparefile: {
		cliCommandName: 'file:import',
		vscodeCommandId: 'suitecloud.comparefile',
		vscodeCommandName: 'Compare with Account File',
	},
	createfile: {
		vscodeCommandId: 'suitecloud.createfile',
		cliCommandName: 'file:create',
		vscodeCommandName: 'Create SuiteScript File',
	},
	createproject: {
		vscodeCommandId: 'suitecloud.createproject',
		cliCommandName: 'project:create',
		vscodeCommandName: 'Create Project',
		vscodeShortName: 'Create Project',
	},
	deploy: {
		vscodeCommandId: 'suitecloud.deploy',
		cliCommandName: 'project:deploy',
		vscodeCommandName: 'Deploy Project',
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
		vscodeCommandName: 'List Objects',
	},
	manageauth: {
		vscodeCommandId: 'suitecloud.manageauth',
		cliCommandName: 'account:manageauth',
		vscodeCommandName: 'Manage Accounts'
	},
	setupaccount: {
		vscodeCommandId: 'suitecloud.setupaccount',
		cliCommandName: 'account:setup',
		vscodeCommandName: 'Set Up Account',
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
	validate: {
		vscodeCommandId: 'suitecloud.validate',
		cliCommandName: 'project:validate',
		vscodeCommandName: 'Validate Project',
	},
	opencontrolpanel: {
		vscodeCommandId: 'suitecloud.opencontrolpanel',
		vscodeCommandName: 'Open Dev Assist Control Panel',
	},
	opendevassistfeedbackform: {
		vscodeCommandId: 'suitecloud.opendevassistfeedbackform',
		vscodeCommandName: 'Open DevAssist Feedback Form',
	},
};
