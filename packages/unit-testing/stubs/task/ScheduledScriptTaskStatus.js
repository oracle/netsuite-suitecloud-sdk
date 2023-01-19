define([], function () {
    /**
     * @class ScheduledScriptTaskStatus
     * @classdesc Encapsulates the status of a scheduled script placed into the NetSuite scheduling queue.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function ScheduledScriptTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name ScheduledScriptTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.taskId = undefined;
        /**
         * Script ID.
         * @name ScheduledScriptTaskStatus#scriptId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.scriptId = undefined;
        /**
         * Script deployment ID.
         * @name ScheduledScriptTaskStatus#deploymentId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.deploymentId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name ScheduledScriptTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.status = undefined;
        /**
         * Returns the object type name (task.ScheduledScriptTaskStatus).
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

    return new ScheduledScriptTaskStatus();
});