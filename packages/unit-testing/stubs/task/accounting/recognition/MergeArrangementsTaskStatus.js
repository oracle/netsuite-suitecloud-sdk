define([], function () {
    /**
     * @protected
     * @constructor
     */
    function MergeArrangementsTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name MergeArrangementsTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */
        this.taskId = undefined;
        /**
         * Merge Arrangements Bulk Process submission ID
         * @name MergeArrangementsTaskStatus#submissionId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */
        this.submissionId = undefined;
        /**
         * Represents the merge process status. Returns one of the task.TaskStatus enum values.
         * @name MergeArrangementsTaskStatus#status
         *
         * @governance 20 units
         *
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */
        this.status = undefined;
        /**
         * Returns an array of internal record IDs of Revenue Arrangement records passed in as input.
         * @name MergeArrangementsTaskStatus#arrangements
         *
         * @governance 10 units
         *
         * @type {Array<number>}
         */
        this.inputArrangements = undefined;
        /**
         * Array of Revenue Elements internal IDs that were passed as input arrangements.
         * @name MergeArrangementsTaskStatus#elements
         *
         * @governance 10 units
         *
         * @type {Array<number>}
         */
        this.inputElements = undefined;
        /**
         * Once the Task Status is Completed, returns the internal record ID of the Revenue Arrangement which got created
         *
         * @governance 10 units
         *
         * @name MergeArrangementsTaskStatus#resultingArrangement
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */
        this.resultingArrangement = undefined;
        /**
         * If the process status is FAILED, this will hold an error message explaining the failure.
         * @name MergeArrangementsTaskStatus#errorMessage
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */
        this.errorMessage = undefined;
        /**
         * Returns the object type name (task.MergeArrangementsTaskStatus).
         *
         * @returns {string}
         */
        this.toString = function () { };

        /**
         * JSON.stringify() implementation.
         *
         * @returns {Object}
         */
        this.toJSON = function () { };
    }
    return new MergeArrangementsTaskStatus();
});