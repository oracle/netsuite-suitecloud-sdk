define([], function () {
    /**
     * @class WorkflowTriggerTaskStatus
     * @classdesc Encapsulates the status of an asynchronous workflow initiation task placed into the NetSuite task queue.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function WorkflowTriggerTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name WorkflowTriggerTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.taskId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name WorkflowTriggerTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.status = undefined;
        /**
         * Returns the object type name (task.WorkflowTriggerTaskStatus).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
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

    return new WorkflowTriggerTaskStatus();
});