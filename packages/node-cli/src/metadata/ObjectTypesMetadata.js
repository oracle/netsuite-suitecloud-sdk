/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = [
	{
		name: 'Address Form',
		value: {
			name: 'Address Form',
			type: 'addressForm',
			prefix: 'custform_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Advanced PDF Template',
		value: {
			name: 'Advanced PDF Template',
			type: 'advancedpdftemplate',
			prefix: 'custtmpl_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Center',
		value: {
			name: 'Center',
			type: 'center',
			prefix: 'custcenter_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Center Category',
		value: {
			name: 'Center Category',
			type: 'centercategory',
			prefix: 'custcentercategory_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Center Link',
		value: {
			name: 'Center Link',
			type: 'centerlink',
			prefix: 'custcenterlink_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Center Tab',
		value: {
			name: 'Center Tab',
			type: 'centertab',
			prefix: 'custcentertab_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Commerce Extension',
		value: {
			name: 'Commerce Extension',
			type: 'commerceextension',
			prefix: 'customextension_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Commerce Theme',
		value: {
			name: 'Commerce Theme',
			type: 'commercetheme',
			prefix: 'custcommercetheme_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'CMS Content Type',
		value: {
			name: 'CMS Content Type',
			type: 'cmscontenttype',
			prefix: 'custcontenttype_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'CRM Field',
		value: {
			name: 'CRM Field',
			type: 'crmcustomfield',
			prefix: 'custevent_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Custom Segment',
		value: {
			name: 'Custom Segment',
			type: 'customsegment',
			prefix: 'cseg_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Custom Transaction',
		value: {
			name: 'Custom Transaction',
			type: 'customtransactiontype',
			prefix: 'customtransaction_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Dataset',
		value: {
			name: 'Dataset',
			type: 'dataset',
			prefix: 'custdataset_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Email Template',
		value: {
			name: 'Email Template',
			type: 'emailtemplate',
			prefix: 'custemailtmpl_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Entity Field',
		value: {
			name: 'Entity Field',
			type: 'entitycustomfield',
			prefix: 'custentity_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Entry Form',
		value: {
			name: 'Entry Form',
			type: 'entryForm',
			prefix: 'custform_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Integration',
		value: {
			name: 'Integration',
			type: 'integration',
			prefix: 'custinteg_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Item Field',
		value: {
			name: 'Item Field',
			type: 'itemcustomfield',
			prefix: 'custitem_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Item Number Field',
		value: {
			name: 'Item Number Field',
			type: 'itemnumbercustomfield',
			prefix: 'custitemnumber_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Item Option Field',
		value: {
			name: 'Item Option Field',
			type: 'itemoptioncustomfield',
			prefix: 'custcol_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'KPI Scorecard',
		value: {
			name: 'KPI Scorecard',
			type: 'kpiscorecard',
			prefix: 'custkpiscorecard_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'List',
		value: {
			name: 'List',
			type: 'customlist',
			prefix: 'customlist_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Other Custom Field',
		value: {
			name: 'Other Custom Field',
			type: 'othercustomfield',
			prefix: 'custrecord_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Plug-in - Advanced Revenue Recognition',
		value: {
			name: 'Plug-in - Advanced Revenue Recognition',
			type: 'advancedrevrecplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Consolidated Rate Adjustor',
		value: {
			name: 'Plug-in - Consolidated Rate Adjustor',
			type: 'consolidatedrateadjustorplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Custom GL Lines',
		value: {
			name: 'Plug-in - Custom GL Lines',
			type: 'customglplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Custom Plug-in Type',
		value: {
			name: 'Plug-in - Custom Plug-in Type',
			type: 'plugintype',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Custom Plug-in Implementation',
		value: {
			name: 'Plug-in - Custom Plug-in Implementation',
			type: 'pluginimplementation',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Email Capture',
		value: {
			name: 'Plug-in - Email Capture',
			type: 'emailcaptureplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Financial Institution Connectivity',
		value: {
			name: 'Plug-in - Financial Institution Connectivity',
			type: 'ficonnectivityplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Parser',
		value: {
			name: 'Plug-in - Parser',
			type: 'bankstatementparserplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Payment Gateway',
		value: {
			name: 'Plug-in - Payment Gateway',
			type: 'paymentgatewayplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Platform Extension',
		value: {
			name: 'Plug-in - Platform Extension',
			type: 'platformextensionplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Promotions',
		value: {
			name: 'Plug-in - Promotions',
			type: 'promotionsplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Shipping Partners',
		value: {
			name: 'Plug-in - Shipping Partners',
			type: 'shippingpartnersplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Plug-in - Tax Calculation',
		value: {
			name: 'Plug-in - Tax Calculation',
			type: 'taxcalculationplugin',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Published Dashboard',
		value: {
			name: 'Published Dashboard',
			type: 'publisheddashboard',
			prefix: 'custpubdashboard_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Record Type',
		value: {
			name: 'Record Type',
			type: 'customrecordtype',
			prefix: 'customrecord_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Role',
		value: {
			name: 'Role',
			type: 'role',
			prefix: 'customrole_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Saved CSV',
		value: {
			name: 'Saved CSV',
			type: 'savedcsvimport',
			prefix: 'custimport_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Saved Search',
		value: {
			name: 'Saved Search',
			type: 'savedsearch',
			prefix: 'customsearch_',
			hasRelatedFiles: false,
		},
	},

	{
		name: 'Script - Bundle Installation',
		value: {
			name: 'Script - Bundle Installation',
			type: 'bundleinstallationscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Client',
		value: {
			name: 'Script - Client',
			type: 'clientscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Custom Record Action',
		value: {
			name: 'Script - Custom Record Action',
			type: 'customrecordactionscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Map/Reduce',
		value: {
			name: 'Script - Map/Reduce',
			type: 'mapreducescript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Mass Update',
		value: {
			name: 'Script - Mass Update',
			type: 'massupdatescript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Portlet',
		value: {
			name: 'Script - Portlet',
			type: 'portlet',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - RESTlet',
		value: {
			name: 'Script - RESTlet',
			type: 'restlet',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Scheduled',
		value: {
			name: 'Script - Scheduled',
			type: 'scheduledscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Suitelet',
		value: {
			name: 'Script - Suitelet',
			type: 'suitelet',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - User Event',
		value: {
			name: 'Script - User Event',
			type: 'usereventscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Script - Workflow Action',
		value: {
			name: 'Script - Workflow Action',
			type: 'workflowactionscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'SDF Installation Script',
		value: {
			name: 'SDF Installation Script',
			type: 'sdfinstallationscript',
			prefix: 'customscript_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Secret',
		value: {
			name: 'Secret',
			type: 'secret',
			prefix: 'custsecret_',
			hasRelatedFiles: true,
			relatedFiles: false,
		},
	},
	{
		name: 'Single Page Application',
		value: {
			name: 'Single Page Application',
			type: 'singlepageapp',
			prefix: 'custspa_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'SSP Application',
		value: {
			name: 'SSP Application',
			type: 'sspapplication',
			prefix: 'webapp_',
			hasRelatedFiles: true,
			relatedFiles: [{ type: 'blankscript' }],
		},
	},
	{
		name: 'Sublist',
		value: {
			name: 'Sublist',
			type: 'sublist',
			prefix: 'custsublist_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Subtab',
		value: {
			name: 'Subtab',
			type: 'subtab',
			prefix: 'custtab_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Transaction Body Field',
		value: {
			name: 'Transaction Body Field',
			type: 'transactionbodycustomfield',
			prefix: 'custbody_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Transaction Column Field',
		value: {
			name: 'Transaction Column Field',
			type: 'transactioncolumncustomfield',
			prefix: 'custcol_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Transaction Form',
		value: {
			name: 'Transaction Form',
			type: 'transactionForm',
			prefix: 'custform_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Translation Collection',
		value: {
			name: 'Translation Collection',
			type: 'translationcollection',
			prefix: 'custcollection_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Workbook',
		value: {
			name: 'Workbook',
			type: 'workbook',
			prefix: 'custworkbook_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Workflow',
		value: {
			name: 'Workflow',
			type: 'workflow',
			prefix: 'customworkflow_',
			hasRelatedFiles: false,
		},
	},
];
