/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export type SuiteScriptTemplateDefinition = {
	id: string;
	name: string;
	defaultFilename: string;
	bodyFilename: string;
};

export const DEFAULT_SUITESCRIPT_TEMPLATE_ID = 'CustomModule';
export const SUITESCRIPT_HEADER_FILENAME = 'ss_header.js';

export const SUITESCRIPT_TEMPLATES = [
	{
		id: 'BundleInstallationScript',
		name: 'Bundle Installation Script',
		defaultFilename: 'BundleInstallationScript.js',
		bodyFilename: 'ss_2_1_bundle_installation.js',
	},
	{
		id: 'ClientScript',
		name: 'Client Script',
		defaultFilename: 'ClientScript.js',
		bodyFilename: 'ss_2_0_client.js',
	},
	{
		id: 'CustomModule',
		name: 'Custom Module',
		defaultFilename: 'CustomModule.js',
		bodyFilename: 'ss_2_1_custom_module.js',
	},
	{
		id: 'plugintypeimpl',
		name: 'Custom Plug-in',
		defaultFilename: 'CustomPlugin.js',
		bodyFilename: 'ss_2_0_plugin_impl.js',
	},
	{
		id: 'customRecordAction',
		name: 'Custom Record Action Script',
		defaultFilename: 'CustomRecordActionScript.js',
		bodyFilename: 'ss_2_1_custom_record_action_impl.js',
	},
	{
		id: 'MapReduceScript',
		name: 'Map/Reduce Script',
		defaultFilename: 'MapReduceScript.js',
		bodyFilename: 'ss_2_1_map_reduce.js',
	},
	{
		id: 'MassUpdateScript',
		name: 'Mass Update Script',
		defaultFilename: 'MassUpdateScript.js',
		bodyFilename: 'ss_2_1_mass_update.js',
	},
	{
		id: 'Portlet',
		name: 'Portlet',
		defaultFilename: 'Portlet.js',
		bodyFilename: 'ss_2_1_portlet.js',
	},
	{
		id: 'Restlet',
		name: 'RESTlet',
		defaultFilename: 'RESTlet.js',
		bodyFilename: 'ss_2_1_restlet.js',
	},
	{
		id: 'ScheduledScript',
		name: 'Scheduled Script',
		defaultFilename: 'ScheduledScript.js',
		bodyFilename: 'ss_2_1_scheduled.js',
	},
	{
		id: 'SDFInstallationScript',
		name: 'SDF Installation Script',
		defaultFilename: 'SDFInstallationScript.js',
		bodyFilename: 'ss_2_1_sdf_installation.js',
	},
	{
		id: 'Suitelet',
		name: 'Suitelet',
		defaultFilename: 'Suitelet.js',
		bodyFilename: 'ss_2_1_suitelet.js',
	},
	{
		id: 'UserEventScript',
		name: 'User Event Script',
		defaultFilename: 'UserEventScript.js',
		bodyFilename: 'ss_2_1_user_event.js',
	},
	{
		id: 'WorkflowActionScript',
		name: 'Workflow Action Script',
		defaultFilename: 'WorkflowActionScript.js',
		bodyFilename: 'ss_2_1_workflow_action.js',
	},
] as const satisfies readonly SuiteScriptTemplateDefinition[];

export const SUITESCRIPT_MODULES = [
	'N/action',
	'N/auth',
	'N/cache',
	'N/certificateControl',
	'N/commerce',
	'N/compress',
	'N/config',
	'N/crypto',
	'N/crypto/certificate',
	'N/crypto/random',
	'N/currency',
	'N/currentRecord',
	'N/dataset',
	'N/documentCapture',
	'N/email',
	'N/encode',
	'N/error',
	'N/file',
	'N/format',
	'N/format/i18n',
	'N/http',
	'N/https',
	'N/https/clientCertificate',
	'N/keyControl',
	'N/llm',
	'N/log',
	'N/machineTranslation',
	'N/pgp',
	'N/piremoval',
	'N/plugin',
	'N/portlet',
	'N/query',
	'N/record',
	'N/recordContext',
	'N/redirect',
	'N/render',
	'N/runtime',
	'N/scriptTypes/restlet',
	'N/search',
	'N/sftp',
	'N/sso',
	'N/suiteAppInfo',
	'N/task',
	'N/task/accounting/recognition',
	'N/transaction',
	'N/translation',
	'N/ui/dialog',
	'N/ui/message',
	'N/ui/serverWidget',
	'N/url',
	'N/util',
	'N/workbook',
	'N/workflow',
	'N/xml',
] as const;
