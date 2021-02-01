/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

const CATEGORY = 'SuiteCloud';

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
	deploy: {
		cliCommandName: 'project:deploy',
		vscodeCommandName: 'Deploy Project',
		vscodeShortName: 'Deploy',
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
		vscodeCommandName: 'Setup Account',
	},
	updateobject: {
		cliCommandName: 'object:update',
		vscodeCommandName: 'Update Single Object with Account Object',
		vscodeShortName: 'Update Object',
	},
};
