/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const commandsInfoMap: {
	[commandName: string]: {
		cliCommandName: string;
		vscodeCommandName: string;
		// not really needed, just left here as an idea
		vscodeShortName?: string;
	};
} = {
	adddependencies: {
		cliCommandName: 'project:adddependencies',
		vscodeCommandName: 'Add Dependency References to the Manifest',
		vscodeShortName: 'Add Dependencies',
	},
	createproject: {
		cliCommandName: 'project:create',
		vscodeCommandName: 'Create SuiteCloud Project...',
		vscodeShortName: 'Create Project',
	},
	deploy: {
		cliCommandName: 'project:deploy',
		vscodeCommandName: 'Deploy Project',
		vscodeShortName: 'Deploy',
	},
	listfiles: {
		cliCommandName: 'file:list',
		vscodeCommandName: 'List Files',
	},
	listobjects: {
		cliCommandName: 'object:list',
		vscodeCommandName: 'List Objects',
	},
	uploadfile: {
		cliCommandName: 'file:upload',
		vscodeCommandName: 'Upload File',
	},
	manageaccounts: {
		cliCommandName: 'account:setup',
		vscodeCommandName: 'Set Up Account',
	},
	updateobject: {
		cliCommandName: 'object:update',
		vscodeCommandName: 'Update Single Object with Account Object',
		vscodeShortName: 'Update Object',
	},
};
