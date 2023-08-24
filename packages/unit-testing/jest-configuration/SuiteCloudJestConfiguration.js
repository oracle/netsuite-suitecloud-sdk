const assert = require('assert');
const path = require('path');
const { PROJECT_FOLDER_ARG } = require('../ApplicationConstants');
const TESTING_FRAMEWORK_PATH = '@oracle/suitecloud-unit-testing';
const CORE_STUBS_PATH = `${TESTING_FRAMEWORK_PATH}/stubs`;
const nodeModulesToTransform = [CORE_STUBS_PATH].join('|');
const SUITESCRIPT_FOLDER_REGEX = '^SuiteScripts(.*)$';
const ProjectInfoService = require('../services/ProjectInfoService');

const PROJECT_TYPE = {
	SUITEAPP: 'SUITEAPP',
	ACP: 'ACP',
};

const CORE_STUBS = [
	{
		module: 'N/action',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/action/action.js`,
	},
	{
		module: 'N/action/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/action/ActionInstance.js`,
	},
	{
		module: 'N/auth',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/auth/auth.js`,
	},
	{
		module: 'N/cache',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/cache/cache.js`,
	},
	{
		module: 'N/cache/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/cache/CacheInstance.js`,
	},
	{
		module: 'N/certificateControl',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/certificateControl/certificateControl.js`,
	},
	{
		module: 'N/certificateControl/certificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/certificateControl/Certificate.js`,
	},
	{
		module: 'N/commerce/recordView',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/recordView.js`,
	},
	{
		module: 'N/commerce/promising',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/promising.js`,
	},
	{
		module: 'N/commerce/webstore/order',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/webstore/order.js`,
	},
	{
		module: 'N/commerce/webstore/shopper',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/webstore/shopper.js`,
	},
	{
		module: 'N/commerce/webstore/shopper/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/webstore/ShopperInstance.js`,
	},
	{
		module: 'N/compress',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/compress/compress.js`,
	},
	{
		module: 'N/compress/archiver',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/compress/Archiver.js`,
	},
	{
		module: 'N/config',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/config/config.js`,
	},
	{
		module: 'N/crypto',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/crypto.js`,
	},
	{
		module: 'N/crypto/certificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/certificate.js`,
	},
	{
		module: 'N/crypto/certificate/signedXml',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/SignedXml.js`,
	},
	{
		module: 'N/crypto/certificate/signer',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/Signer.js`,
	},
	{
		module: 'N/crypto/certificate/verifier',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/Verifier.js`,
	},
	{
		module: 'N/crypto/cipher',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Cipher.js`,
	},
	{
		module: 'N/crypto/cipherPayload',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/CipherPayload.js`,
	},
	{
		module: 'N/crypto/decipher',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Decipher.js`,
	},
	{
		module: 'N/crypto/hash',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Hash.js`,
	},
	{
		module: 'N/crypto/hmac',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Hmac.js`,
	},
	{
		module: 'N/crypto/secretKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/SecretKey.js`,
	},
	{
		module: 'N/currency',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currency/currency.js`,
	},
	{
		module: 'N/currentRecord',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currentRecord/currentRecord.js`,
	},
	{
		module: 'N/currentRecord/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currentRecord/CurrentRecordInstance.js`,
	},
	{
		module: 'N/currentRecord/field',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Field.js`,
	},
	{
		module: 'N/currentRecord/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Column.js`,
	},
	{
		module: 'N/currentRecord/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Sublist.js`,
	},
	{
		module: 'N/dataset',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/dataset.js`,
	},
	{
		module: 'N/dataset/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/DatasetInstance.js`,
	},
	{
		module: 'N/dataset/condition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/Condition.js`,
	},
	{
		module: 'N/dataset/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/Column.js`,
	},
	{
		module: 'N/dataset/join',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/Join.js`,
	},
	{
		module: 'N/datasetLink',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/datasetLink/datasetLink.js`,
	},
	{
		module: 'N/datasetLink/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/datasetLink/DatasetLinkInstance.js`,
	},
	{
		module: 'N/email',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/email/email.js`,
	},
	{
		module: 'N/error',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/error/error.js`,
	},
	{
		module: 'N/error/suiteScriptError',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/error/SuiteScriptError.js`,
	},
	{
		module: 'N/error/userEventError',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/error/UserEventError.js`,
	},
	{
		module: 'N/encode',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/encode/encode.js`,
	},
	{
		module: 'N/file',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/file/file.js`,
	},
	{
		module: 'N/file/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/file/FileInstance.js`,
	},
	{
		module: 'N/file/fileLines',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/file/FileLines.js`,
	},
	{
		module: 'N/file/fileSegments',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/file/FileSegments.js`,
	},
	{
		module: 'N/file/reader',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/file/Reader.js`,
	},
	{
		module: 'N/format',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/format.js`,
	},
	{
		module: 'N/format/i18n',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/i18n/i18n.js`,
	},
	{
		module: 'N/format/i18n/currencyFormatter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/i18n/CurrencyFormatter.js`,
	},
	{
		module: 'N/format/i18n/numberFormatter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/i18n/NumberFormatter.js`,
	},
	{
		module: 'N/format/i18n/phoneNumber',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/i18n/PhoneNumber.js`,
	},
	{
		module: 'N/format/i18n/phoneNumberFormatter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/i18n/PhoneNumberFormatter.js`,
	},
	{
		module: 'N/format/i18n/phoneNumberParser',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/i18n/PhoneNumberParser.js`,
	},
	{
		module: 'N/http',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/http/http.js`,
	},
	{
		module: 'N/http/clientResponse',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/http/ClientResponse.js`,
	},
	{
		module: 'N/https',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/https.js`,
	},
	{
		module: 'N/https/clientResponse',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/ClientResponse.js`,
	},
	{
		module: 'N/https/secretKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/SecretKey.js`,
	},
	{
		module: 'N/https/secureString',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/SecureString.js`,
	},
	{
		module: 'N/https/clientCertificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/clientCertificate/clientCertificate.js`,
	},
	{
		module: 'N/keyControl',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/keyControl/keyControl.js`,
	},
	{
		module: 'N/keyControl/key',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/keyControl/Key.js`,
	},
	{
		module: 'N/log',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/log/log.js`,
	},
	{
		module: 'N/piremoval',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/piremoval/piremoval.js`,
	},
	{
		module: 'N/piremoval/piRemovalTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/piremoval/PiRemovalTask.js`,
	},
	{
		module: 'N/piremoval/piRemovalTaskLogItem',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/piremoval/PiRemovalTaskLogItem.js`,
	},
	{
		module: 'N/piremoval/piRemovalTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/piremoval/PiRemovalTaskStatus.js`,
	},
	{
		module: 'N/plugin',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/plugin/plugin.js`,
	},
	{
		module: 'N/portlet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/portlet/portlet.js`,
	},
	{
		module: 'N/query',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/query.js`,
	},
	{
		module: 'N/query/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/QueryInstance.js`,
	},
	{
		module: 'N/query/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Column.js`,
	},
	{
		module: 'N/query/component',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Component.js`,
	},
	{
		module: 'N/query/iterator',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Iterator.js`,
	},
	{
		module: 'N/query/page',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Page.js`,
	},
	{
		module: 'N/query/pagedData',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/PagedData.js`,
	},
	{
		module: 'N/query/pageRange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/PageRange.js`,
	},
	{
		module: 'N/query/period',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Period.js`,
	},
	{
		module: 'N/query/relativeDate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/RelativeDate.js`,
	},
	{
		module: 'N/query/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Result.js`,
	},
	{
		module: 'N/query/resultSet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/ResultSet.js`,
	},
	{
		module: 'N/query/sort',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Sort.js`,
	},
	{
		module: 'N/query/suiteQL',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/SuiteQL.js`,
	},
	{
		module: 'N/record',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/record.js`,
	},
	{
		module: 'N/record/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/RecordInstance.js`,
	},
	{
		module: 'N/record/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Column.js`,
	},
	{
		module: 'N/record/field',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Field.js`,
	},
	{
		module: 'N/record/line',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Line.js`,
	},
	{
		module: 'N/record/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Sublist.js`,
	},
	{
		module: 'N/recordContext',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/recordContext/recordContext.js`,
	},
	{
		module: 'N/redirect',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/redirect/redirect.js`,
	},
	{
		module: 'N/render',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/render/render.js`,
	},
	{
		module: 'N/render/emailMergeResult',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/render/EmailMergeResult.js`,
	},
	{
		module: 'N/render/templateRenderer',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/render/TemplateRenderer.js`,
	},
	{
		module: 'N/runtime',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/runtime.js`,
	},
	{
		module: 'N/runtime/script',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/Script.js`,
	},
	{
		module: 'N/runtime/session',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/Session.js`,
	},
	{
		module: 'N/runtime/user',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/User.js`,
	},
	{
		module: 'N/search',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/search.js`,
	},
	{
		module: 'N/search/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchInstance.js`,
	},
	{
		module: 'N/search/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Column.js`,
	},
	{
		module: 'N/search/filter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Filter.js`,
	},
	{
		module: 'N/search/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Result.js`,
	},
	{
		module: 'N/search/resultSet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/ResultSet.js`,
	},
	{
		module: 'N/search/pagedData',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPagedData.js`,
	},
	{
		module: 'N/search/pageRange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPageRange.js`,
	},
	{
		module: 'N/search/setting',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Setting.js`,
	},
	{
		module: 'N/sftp',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/sftp/sftp.js`,
	},
	{
		module: 'N/sftp/connection',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/sftp/Connection.js`,
	},
	{
		module: 'N/sso',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/sso/sso.js`,
	},
	{
		module: 'N/suiteAppInfo',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/suiteAppInfo/suiteAppInfo.js`,
	},
	{
		module: 'N/task/accounting/recognition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/accounting/recognition/recognition.js`,
	},
	{
		module: 'N/task/accounting/recognition/mergeArrangementsTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/accounting/recognition/MergeArrangementsTask.js`,
	},
	{
		module: 'N/task/accounting/recognition/mergeArrangementsTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/accounting/recognition/MergeArrangementsTaskStatus.js`,
	},
	{
		module: 'N/task/accounting/recognition/mergeElementsTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/accounting/recognition/MergeElementsTask.js`,
	},
	{
		module: 'N/task',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/task.js`,
	},
	{
		module: 'N/task/csvImportTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/CsvImportTask.js`,
	},
	{
		module: 'N/task/csvImportTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/CsvImportTaskStatus.js`,
	},
	{
		module: 'N/task/entityDeduplicationTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/EntityDeduplicationTask.js`,
	},
	{
		module: 'N/task/entityDeduplicationTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/EntityDeduplicationTaskStatus.js`,
	},
	{
		module: 'N/task/mapReduceScriptTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/MapReduceScriptTask.js`,
	},
	{
		module: 'N/task/mapReduceScriptTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/MapReduceScriptTaskStatus.js`,
	},
	{
		module: 'N/task/pivotExecutionTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/PivotExecutionTask.js`,
	},
	{
		module: 'N/task/pivotTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/PivotTaskStatus.js`,
	},
	{
		module: 'N/task/queryTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/QueryTask.js`,
	},
	{
		module: 'N/task/queryTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/QueryTaskStatus.js`,
	},
	{
		module: 'N/task/recordActionTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/RecordActionTask.js`,
	},
	{
		module: 'N/task/recordActionTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/RecordActionTaskStatus.js`,
	},
	{
		module: 'N/task/scheduledScriptTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/ScheduledScriptTask.js`,
	},
	{
		module: 'N/task/scheduledScriptTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/ScheduledScriptTaskStatus.js`,
	},
	{
		module: 'N/task/searchTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/SearchTask.js`,
	},
	{
		module: 'N/task/searchTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/SearchTaskStatus.js`,
	},
	{
		module: 'N/task/suiteQLTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/SuiteQLTask.js`,
	},
	{
		module: 'N/task/suiteQLTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/SuiteQLTaskStatus.js`,
	},
	{
		module: 'N/task/workflowTriggerTask',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/WorkflowTriggerTask.js`,
	},
	{
		module: 'N/task/workflowTriggerTaskStatus',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/task/WorkflowTriggerTaskStatus.js`,
	},
	{
		module: 'N/transaction',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/transaction/transaction.js`,
	},
	{
		module: 'N/translation',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/translation/translation.js`,
	},
	{
		module: 'N/translation/handle',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/translation/Handle.js`,
	},
	{
		module: 'N/ui',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/ui.js`,
	},
	{
		module: 'N/ui/dialog',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/dialog/dialog.js`,
	},
	{
		module: 'N/ui/message',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/message/message.js`,
	},
	{
		module: 'N/ui/message/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/message/MessageInstance.js`,
	},
	{
		module: 'N/ui/serverWidget',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/serverWidget.js`,
	},
	{
		module: 'N/ui/serverWidget/assistant',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/Assistant.js`,
	},
	{
		module: 'N/ui/serverWidget/assistantStep',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/AssistantStep.js`,
	},
	{
		module: 'N/ui/serverWidget/button',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/Button.js`,
	},
	{
		module: 'N/ui/serverWidget/field',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/Field.js`,
	},
	{
		module: 'N/ui/serverWidget/fieldGroup',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/FieldGroup.js`,
	},
	{
		module: 'N/ui/serverWidget/form',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/Form.js`,
	},
	{
		module: 'N/ui/serverWidget/list',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/List.js`,
	},
	{
		module: 'N/ui/serverWidget/listColumn',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/ListColumn.js`,
	},
	{
		module: 'N/ui/serverWidget/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/Sublist.js`,
	},
	{
		module: 'N/ui/serverWidget/tab',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/ui/serverWidget/Tab.js`,
	},
	{
		module: 'N/url',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/url/url.js`,
	},
	{
		module: 'N/util',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/util/util.js`,
	},
	{
		module: 'N/xml',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/xml.js`,
	},
	{
		module: 'N/xml/attr',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Attr.js`,
	},
	{
		module: 'N/xml/document',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Document.js`,
	},
	{
		module: 'N/xml/element',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Element.js`,
	},
	{
		module: 'N/xml/node',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Node.js`,
	},
	{
		module: 'N/xml/parser',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Parser.js`,
	},
	{
		module: 'N/xml/xPath',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/XPath.js`,
	},
	{
		module: 'N/workbook',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/workbook.js`,
	},
	{
		module: 'N/workbook/aspect',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Aspect.js`,
	},
	{
		module: 'N/workbook/calculatedMeasure',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/CalculatedMeasure.js`,
	},
	{
		module: 'N/workbook/category',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Category.js`,
	},
	{
		module: 'N/workbook/chart',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Chart.js`,
	},
	{
		module: 'N/workbook/chartAxis',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ChartAxis.js`,
	},
	{
		module: 'N/workbook/childNodesSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ChildNodesSelector.js`,
	},
	{
		module: 'N/workbook/color',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Color.js`,
	},
	{
		module: 'N/workbook/conditionalFilter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ConditionalFilter.js`,
	},
	{
		module: 'N/workbook/conditionalFormat',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ConditionalFormat.js`,
	},
	{
		module: 'N/workbook/conditionalFormatRule',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ConditionalFormatRule.js`,
	},
	{
		module: 'N/workbook/currency',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Currency.js`,
	},
	{
		module: 'N/workbook/dataDimension',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimension.js`,
	},
	{
		module: 'N/workbook/dataDimensionItem',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimensionItem.js`,
	},
	{
		module: 'N/workbook/dataDimensionValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimensionValue.js`,
	},
	{
		module: 'N/workbook/dataDimensionItemValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimensionItemValue.js`,
	},
	{
		module: 'N/workbook/dataMeasure',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataMeasure.js`,
	},
	{
		module: 'N/workbook/descendantOrSelfNodesSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DescendantOrSelfNodesSelector.js`,
	},
	{
		module: 'N/workbook/dimensionSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DimensionSelector.js`,
	},
	{
		module: 'N/workbook/duration',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Duration.js`,
	},
	{
		module: 'N/workbook/expression',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Expression.js`,
	},
	{
		module: 'N/workbook/fieldContext',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/FieldContext.js`,
	},
	{
		module: 'N/workbook/fontSize',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/FontSize.js`,
	},
	{
		module: 'N/workbook/legend',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Legend.js`,
	},
	{
		module: 'N/workbook/limitingFilter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/LimitingFilter.js`,
	},
	{
		module: 'N/workbook/measureSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureSelector.js`,
	},
	{
		module: 'N/workbook/measureSort',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureSort.js`,
	},
	{
		module: 'N/workbook/measureValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureValue.js`,
	},
	{
		module: 'N/workbook/measureValueSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureValueSelector.js`,
	},
	{
		module: 'N/workbook/pathSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PathSelector.js`,
	},
	{
		module: 'N/workbook/pivot',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Pivot.js`,
	},
	{
		module: 'N/workbook/pivotAxis',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PivotAxis.js`,
	},
	{
		module: 'N/workbook/pivotIntersection',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PivotIntersection.js`,
	},
	{
		module: 'N/workbook/pivotResultsIterator',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PivotResultsIterator.js`,
	},
	{
		module: 'N/workbook/positionPercent',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PositionPercent.js`,
	},
	{
		module: 'N/workbook/positionUnits',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PositionUnits.js`,
	},
	{
		module: 'N/workbook/positionValues',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PositionValues.js`,
	},
	{
		module: 'N/workbook/range',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Range.js`,
	},
	{
		module: 'N/workbook/record',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Record.js`,
	},
	{
		module: 'N/workbook/recordKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/RecordKey.js`,
	},
	{
		module: 'N/workbook/reportStyle',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ReportStyle.js`,
	},
	{
		module: 'N/workbook/reportStyleRule',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ReportStyleRule.js`,
	},
	{
		module: 'N/workbook/section',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Section.js`,
	},
	{
		module: 'N/workbook/sectionValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SectionValue.js`,
	},
	{
		module: 'N/workbook/series',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Series.js`,
	},
	{
		module: 'N/workbook/sort',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Sort.js`,
	},
	{
		module: 'N/workbook/sortByDataDimensionItem',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SortByDataDimensionItem.js`,
	},
	{
		module: 'N/workbook/sortByMeasure',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SortByMeasure.js`,
	},
	{
		module: 'N/workbook/sortDefinition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SortDefinition.js`,
	},
	{
		module: 'N/workbook/style',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Style.js`,
	},
	{
		module: 'N/workbook/table',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Table.js`,
	},
	{
		module: 'N/workbook/tableColumn',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/TableColumn.js`,
	},
	{
		module: 'N/workbook/tableColumnCondition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/TableColumnCondition.js`,
	},
	{
		module: 'N/workbook/tableColumnFilter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/TableColumnFilter.js`,
	},
	{
		module: 'N/workbook/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/WorkbookInstance.js`,
	},
	{
		module: 'N/workflow',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workflow/workflow.js`,
	},
];

class SuiteCloudAdvancedJestConfiguration {
	constructor(options) {
		assert(options.projectFolder, "The 'projecFolder' property must be specified to generate a SuiteCloud Jest configuration");
		assert(options.projectType, "The 'projectType' property must be specified to generate a SuiteCloud Jest configuration");
		this.projectFolder = this._getProjectFolder(options.projectFolder);
		this.projectType = options.projectType;
		this.customStubs = options.customStubs;
		if (this.customStubs == null) {
			this.customStubs = [];
		}

		this.projectInfoService = new ProjectInfoService(this.projectFolder);
	}

	_getProjectFolder(projectFolder) {
		if (process.argv && process.argv.length > 0) {
			for (let i = 0; i < process.argv.length; i++) {
				let argv = process.argv[i].split('=');
				if (argv.length === 2 && argv[0] === PROJECT_FOLDER_ARG) {
					return path.join(argv[1], projectFolder);
				}
			}
		}
		return path.join(process.cwd(), projectFolder);
	}

	_getSuiteScriptFolderPath() {
		if (this.projectType === PROJECT_TYPE.ACP) {
			return `${this.projectFolder}/FileCabinet/SuiteScripts$1`;
		}
		if (this.projectType === PROJECT_TYPE.SUITEAPP) {
			let applicationId = this.projectInfoService.getApplicationId();
			return `${this.projectFolder}/FileCabinet/SuiteApps/${applicationId}$1`;
		}
		throw 'Unrecognized projectType. Please revisit your SuiteCloud Jest configuration';
	}

	_generateStubsModuleNameMapperEntries() {
		const stubs = {};
		const forEachFn = (stub) => {
			stubs[`^${stub.module}$`] = stub.path;
		};
		CORE_STUBS.forEach(forEachFn);
		this.customStubs.forEach(forEachFn);

		return stubs;
	}

	generate() {
		const suiteScriptsFolder = {};
		suiteScriptsFolder[SUITESCRIPT_FOLDER_REGEX] = this._getSuiteScriptFolderPath();

		const customizedModuleNameMapper = Object.assign({}, this._generateStubsModuleNameMapperEntries(), suiteScriptsFolder);
		return {
			transformIgnorePatterns: [`/node_modules/(?!${nodeModulesToTransform})`],
			transform: {
				'^.+\\.js$': `<rootDir>/node_modules/${TESTING_FRAMEWORK_PATH}/jest-configuration/SuiteCloudJestTransformer.js`,
			},
			moduleNameMapper: customizedModuleNameMapper,
		};
	}
}

module.exports = {
	build: (options) => {
		return new SuiteCloudAdvancedJestConfiguration(options).generate();
	},
	ProjectType: PROJECT_TYPE,
};
