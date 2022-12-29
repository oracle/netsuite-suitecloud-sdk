define([], function () {
    /**
     * @class SuiteQLTask
     * @classdesc Encapsulates the properties required to initiate an asynchronous SuiteQL.
     * @protected
     * @constructor
     *
     * @since 2020.2
     */
    function SuiteQLTask() {

        /**
         * The ID of the task.
         * @name SuiteQLTask#id
         * @type {number}
         *
         * @since 2020.2
         */
        this.id = undefined;
        /**
         * SuiteQL query
         * @name SuiteQLTask#query
         * @type {string}
         *
         * @since 2020.2
         */
        this.query = undefined;
        /**
         * SuiteQL parameters
         * @name SuiteQLTask#params
         * @type {string}
         *
         * @since 2020.2
         */
        this.params = undefined;
        /**
         * Id of CVS file to export results of search into. See N/file.
         * If fileId is provided then parameter filePath is ignored.
         * There's no synchronization between fileId and filePath attributes.
         * @name SuiteQLTask#fileId
         * @throws {error.SuiteScriptError} PROPERTY_VALUE_CONFLICT if trying to se both SuiteQLTask#filePath and QueryTask#fileId
         * @type {number}
         *
         * @since 2020.2
         */
        this.fileId = undefined;
        /**
         * Path of CVS file to export results of search into. See N/file.
         * If fileId is provided then parameter filePath is ignored.
         * There's no synchronization between fileId and filePath attributes.
         * @name SuiteQLTask#filePath
         * @throws {error.SuiteScriptError} PROPERTY_VALUE_CONFLICT if trying to se both SuiteQLTask#filePath and QueryTask#fileId
         * @type {number}
         *
         * @since 2020.2
         */
        this.filePath = undefined;
        /**
         * Completion scripts which will be run when the async query finishes.
         * When submission succeeds an id attribute will be added into each completion task.
         *
         * @name SuiteQLTask#inboundDependencies
         * @type {Array<Object>}
         * @readonly
         * @throws {error.SuiteScriptError} READ_ONLY_PROPERTY when setting of the property is attempted
         *
         * @since 2020.2
         */
        this.inboundDependencies = undefined;
        /**
         * Submits the task and returns an unique ID. Sets inbound dependency (task) id in inboundDependencies attribute on successful submit.
         *
         * @governance 100 units
         *
         * @returns {String} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         * @throws {error.SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required parameter is missing
         * @throws {error.SuiteScriptError} YOU_DO_NOT_HAVE_ACCESS_TO_THE_MEDIA_ITEM_YOU_SELECTED if you do not have permission to access the file
         * @throws {error.SuiteScriptError} THAT_RECORD_DOES_NOT_EXIST if file object references non existing file
         * @throws {error.SuiteScriptError} MUST_IDENTIFY_A_FILE if path specifies folder
         * @throws {error.SuiteScriptError} CANNOT_RESUBMIT_SUBMITTED_ASYNC_SUITEQL_TASK an attempt to submit a SuiteQL task instance which has been submitted successfully before
         * @throws {SuiteScriptError} ASYNC_SUITEQL_DEPENDENCY_MR_ALREADY_SUBMITTED map reduce dependency has had already been submitted and has not finished yet
         * @throws {SuiteScriptError} ASYNC_SUITEQL_DEPENDENCY_MR_INCORRECT_STATUS status of map reduce dependency script is incorrect, it has to be "Not Scheduled"
         * @throws {SuiteScriptError} ASYNC_SUITEQL_DEPENDENCY_SS_ALREADY_SUBMITTED scheduled script dependency has had already been submitted and has not finished yet
         * @throws {SuiteScriptError} ASYNC_SUITEQL_DEPENDENCY_SS_INCORRECT_STATUS status of scheduled script dependency script is incorrect, it has to be "Not Scheduled"
         * @throws {SuiteScriptError} ASYNC_SUITEQL_DEPLOYMENT_FOR_DEPENDENCY no available deployment was found for dependency
         * @throws {SuiteScriptError} ASYNC_SUITEQL_MULTIPLE_DEPENDENCIES multiple dependencies with the same script id were submitted
         * @throws {SuiteScriptError} ASYNC_SUITEQL_SCRIPT_ID_NOT_FOUND script with the entered id was not found
         *
         * @since 2020.2
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.QueryTask).
         * @restriction Server SuiteScript only
         * @governance none
         * @returns {string}
         *
         * @since 2020.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.2
         */
        this.toJSON = function () { };

        /**
         * Adds an inbound dependency (completion script).
         * @restriction Server SuiteScript only
         * @param {Object} options
         * @param {Object} options.taskType task.TaskType.SCHEDULED_SCRIPT | task.TaskType.MAP_REDUCE
         * @param {Object} options.query
         * @param {Object} [options.deploymentId] optional, the script has to be deployed, a free deployment id can be detected automatically if available
         * @param {Object} [options.params] a previosly created script parameter has to be set to async search csv result file id if the file is needed in the script, e.g. {'custscript_srch_res' : 'File.csv'}
         * @return {void}
         *
         * @since 2020.2
         */
        this.addInboundDependency = function (options) { };
    }

    return new SuiteQLTask();
});