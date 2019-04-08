module.exports = [
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
		name: 'Center Tab',
		value: {
			name: 'Center Tab',
			type: 'centertab',
			prefix: 'custcentertab_',
			hasRelatedFiles: false,
		},
	},
	{
		name: 'Commerce Theme',
		value: {
			name: 'Commerce Theme',
			type: 'commercetheme',
			prefix: 'custcommercetheme_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Commerce Extension',
		value: {
			name: 'Commerce Extension',
			type: 'commerceextension',
			prefix: 'customextension_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
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
		name: 'Plug-in - Custom GL Lines',
		value: {
			name: 'Plug-in - Custom GL Lines',
			type: 'customglplugin',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Plug-in - Custom Plug-in Type',
		value: {
			name: 'Plug-in - Custom Plug-in Type',
			type: 'plugintype',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Plug-in - Custom Plug-in Implementation',
		value: {
			name: 'Plug-in - Custom Plug-in Implementation',
			type: 'pluginimplementation',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Plug-in - Email Capture',
		value: {
			name: 'Plug-in - Email Capture',
			type: 'emailcaptureplugin',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Plug-in - Promotions',
		value: {
			name: 'Plug-in - Promotions',
			type: 'promotionsplugin',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
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
		name: 'Script - Bundle Installation',
		value: {
            name: 'Script - Bundle Installation',
			type: 'bundleinstallationscript',
            prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Client',
		value: {
            name: 'Script - Client',
			type: 'clientscript',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Map/Reduce',
		value: {
            name: 'Script - Map/Reduce',
			type: 'mapreducescript',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Mass Update',
		value: {
            name: 'Script - Mass Update',
			type: 'massupdatescript',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Portlet',
		value: {
            name: 'Script - Portlet',
			type: 'portlet',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - RESTlet',
		value: {
            name: 'Script - RESTlet',
			type: 'restlet',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Scheduled',
		value: {
            name: 'Script - Scheduled',
			type: 'scheduledscript',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Suitelet',
		value: {
            name: 'Script - Suitelet',
			type: 'suitelet',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - User Event',
		value: {
            name: 'Script - User Event',
			type: 'usereventscript',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'Script - Workflow Action',
		value: {
            name: 'Script - Workflow Action',
			type: 'workflowactionscript',
			prefix: 'customscript_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
		},
	},
	{
		name: 'SSP Application',
		value: {
            name: 'SSP Application',
			type: 'sspapplication',
			prefix: 'webapp_',
            hasRelatedFiles: true,
            relatedFiles: [
                { type:'blankscript' }
            ]
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
		name: 'Workflow',
		value: {
            name: 'Workflow',
			type: 'workflow',
			prefix: 'customworkflow_',
			hasRelatedFiles: false,
		},
	},
];
