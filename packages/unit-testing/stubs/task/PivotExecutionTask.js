define([], function () {
    /**
     * @class PivotExecutionTask
     * @classdesc Encapsulates all the properties of a pivot execution task in SuiteScript. Use this object to submit a pivot for execution.
     * @protected
     * @constructor
     *
     * @since 2021.2
     */
    function PivotExecutionTask() {

        /**
         * The ID of the task.
         * @name PivotExecutionTask#pivotStorageId
         * @type {number}
         *
         * @since 2021.2
         */
        this.pivotStorageId = undefined;
        /**
         * Id of the pivot in workbook
         * @name PivotExecutionTask#pivotId
         * @type {string}
         *
         * @since 2021.2
         */
        this.pivotId = undefined;
        /**
         * Workbook with pivot to execute
         * @name PivotExecutionTask#workbook
         * @type {Workbook}
         *
         * @since 2021.2
         */
        this.workbook = undefined;
        /**
         * Id of the pivot task
         * @name PivotExecutionTask#id
         * @type {Object}
         *
         * @since 2021.2
         */
        this.id = undefined;
        /**
         * Adds an inbound dependency (completion script).
         * @restriction Server SuiteScript only
         * @param {Object} options
         * @param {Object} options.task MapReduce or ScheduledScript task
         * @return {void}
         *
         * @since 2021.2
         */
        this.addInboundDependency = function (options) { };

        /**
         * Submits the task and returns an unique ID. Sets inbound dependency (task) id in inboundDependencies attribute on successful submit.
         *
         * @governance 100 units
         *
         * @returns {String} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         * @throws {error.SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required parameter is missing
         * @throws {error.SuiteScriptError} CANNOT_RESUBMIT_SUBMITTED_ASYNC_PIVOT_TASK an attempt to submit a pivot execution task instance which has been submitted successfully before
         * @throws {SuiteScriptError} PIVOT_EXECUTION_DEPENDENCY_MR_ALREADY_SUBMITTED map reduce dependency has had already been submitted and has not finished yet
         * @throws {SuiteScriptError} PIVOT_EXECUTION_DEPENDENCY_MR_INCORRECT_STATUS status of map reduce dependency script is incorrect, it has to be "Not Scheduled"
         * @throws {SuiteScriptError} PIVOT_EXECUTION_DEPENDENCY_SS_ALREADY_SUBMITTED scheduled script dependency has had already been submitted and has not finished yet
         * @throws {SuiteScriptError} PIVOT_EXECUTION_DEPENDENCY_SS_INCORRECT_STATUS status of scheduled script dependency script is incorrect, it has to be "Not Scheduled"
         * @throws {SuiteScriptError} PIVOT_EXECUTION_DEPLOYMENT_FOR_DEPENDENCY no available deployment was found for dependency
         * @throws {SuiteScriptError} PIVOT_EXECUTION_MULTIPLE_DEPENDENCIES multiple dependencies with the same script id were submitted
         * @throws {SuiteScriptError} PIVOT_EXECUTION_SCRIPT_ID_NOT_FOUND script with the entered id was not found
         *
         * @since 2021.2
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.PivotExecutionTask)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2021.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    return new PivotExecutionTask();
});