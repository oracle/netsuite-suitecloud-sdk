define([], function () {
    /**
     * @class SearchTask
     * @classdesc Encapsulates the properties required to initiate an asynchronous search.
     * @protected
     * @constructor
     *
     * @since 2017.1
     */
    function SearchTask() {

        /**
         * The ID of the task.
         * @name SearchTask#id
         * @type {number}
         *
         * @since 2017.1
         */
        this.id = undefined;
        /**
         * An ID of saved search to be executed during the task.
         * @name SearchTask#savedSearchId
         * @type {number}
         *
         * @since 2017.1
         */
        this.savedSearchId = undefined;
        /**
         * Id of CVS file to export results of search into. See N/file.
         * If fileId is provided then parameter filePath is ignored.
         * There's no synchronization between fileId and filePath attributes.
         * @name SearchTask#fileId
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT if trying to se both SearchTask#filePath and SearchTask#fileId
         * @type {number}
         *
         * @since 2017.1
         */
        this.fileId = undefined;
        /**
         * Path of CVS file to export results of search into. See N/file.
         * If fileId is provided then parameter filePath is ignored.
         * There's no synchronization between fileId and filePath attributes.
         * @name SearchTask#filePath
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT if trying to se both SearchTask#filePath and SearchTask#fileId
         * @type {number}
         *
         * @since 2017.1
         */
        this.filePath = undefined;
        /**
         * Completion scripts which will be run when the async search finishes.
         * When submission succeeds an id attribute will be added into each completion task.
         *
         * Example - two inbound dependencies, a Scheduled Script and a Map Reduce Script.
         *
         * inboundDependencies before submit(), after adding two inbound dependencies:
         * {"0":{"type":"task.ScheduledScriptTask","scriptId":"customscript_as_ftr_ss","deploymentId":"customdeploy_ss_dpl","params":{"custscript_ss_as_srch_res":"SuiteScripts/ExportFile.csv"}},
         * "1":{"type":"task.MapReduceScriptTask","scriptId":"customscript_as_ftr_mr","deploymentId":"customdeploy_mr_dpl","params":{"custscript_mr_as_srch_res":"SuiteScripts/ExportFile.csv"}}}
         *
         * inboundDependencies after succesfull submit(), id was added into tasks:
         * {"0":{"type":"task.ScheduledScriptTask","id":"SCHEDSCRIPT_0168697b126d1705061d0d690a787755500b046a1912686b10_349d94266564827c739a2ba0a5b9d476f4097217","scriptId":"customscript_as_ftr_ss","deploymentId":"customdeploy_ss_dpl","params":{"custscript_ss_as_srch_res":"SuiteScripts/ExportFile.csv"}},
         * "1":{"type":"task.MapReduceScriptTask","id":"MAPREDUCETASK_0268697b126d1705061d0d69027f7b39560f01001c_7a02acb4bdebf0103120b09302170720aa57bca4","scriptId":"customscript_as_ftr_mr","deploymentId":"customdeploy_mr_dpl","params":{"custscript_mr_as_srch_res":"SuiteScripts/ExportFile.csv"}}}
         *
         * @name SearchTask#inboundDependencies
         * @type {Array<Object>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting of the property is attempted
         *
         * @since 2018.2
         */
        this.inboundDependencies = undefined;
        /**
         * Submits the task and returns an unique ID. Sets inbound dependency (task) id in inboundDependencies attribute on successful submit.
         *
         * @governance 100 units
         *
         * @return {string} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required parameter is missing
         * @throws {SuiteScriptError} YOU_DO_NOT_HAVE_ACCESS_TO_THE_MEDIA_ITEM_YOU_SELECTED if you do not have permission to access the file
         * @throws {SuiteScriptError} THAT_RECORD_DOES_NOT_EXIST if file object references non existing file
         * @throws {SuiteScriptError} MUST_IDENTIFY_A_FILE if path specifies folder
         * @throws {SuiteScriptError} CANNOT_RESUBMIT_SUBMITTED_ASYNC_SEARCH_TASK an attempt to submit a search task instance which has been submitted successfully before
         * @throws {SuiteScriptError} ASYNC_SEARCH_DEPENDENCY_MR_ALREADY_SUBMITTED map reduce dependency has had already been submitted and has not finished yet
         * @throws {SuiteScriptError} ASYNC_SEARCH_DEPENDENCY_MR_INCORRECT_STATUS status of map reduce dependency script is incorrect, it has to be "Not Scheduled"
         * @throws {SuiteScriptError} ASYNC_SEARCH_DEPENDENCY_SS_ALREADY_SUBMITTED scheduled script dependency has had already been submitted and has not finished yet
         * @throws {SuiteScriptError} ASYNC_SEARCH_DEPENDENCY_SS_INCORRECT_STATUS status of scheduled script dependency script is incorrect, it has to be "Not Scheduled"
         * @throws {SuiteScriptError} ASYNC_SEARCH_DEPLOYMENT_FOR_DEPENDENCY no available deployment was found for dependency
         * @throws {SuiteScriptError} ASYNC_SEARCH_MULTIPLE_DEPENDENCIES multiple dependencies with the same script id were submitted
         * @throws {SuiteScriptError} ASYNC_SEARCH_SCRIPT_ID_NOT_FOUND script with the entered id was not found
         * @throws {SuiteScriptError} ASYNC_SEARCH_SEARCH_ID_NOT_FOUND search id was not found
         *
         * @since 2017.1
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.SearchTask).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2017.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2017.1
         */
        this.toJSON = function () { };

        /**
         * Adds an inbound dependency (completion script).
         * @restriction Server SuiteScript only
         * @param {Object} options
         * @param {Object} options.taskType task.TaskType.SCHEDULED_SCRIPT | task.TaskType.MAP_REDUCE
         * @param {Object} options.scriptId
         * @param {Object} [options.deploymentId] optional, the script has to be deployed, a free deployment id can be detected automatically if available
         * @param {Object} [options.params] a previosly created script parameter has to be set to async search csv result file id if the file is needed in the script, e.g. {'custscript_srch_res' : 'File.csv'}
         * @return {void}
         *
         * @since 2018.2
         */
        this.addInboundDependency = function (options) { };
    }

    return new SearchTask();
});