define([], function () {
    /**
     * @class PivotTaskStatus
     * @classdesc Encapsulates the status of a pivot execution
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function PivotTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name PivotTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2021.2
         */
        this.taskId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name PivotTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2021.2
         */
        this.status = undefined;
        /**
         * Returns the object type name (task.PivotTaskStatus).
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
         * @since 2021.2
         */
        this.toJSON = function () { };
    }

    return new PivotTaskStatus();
});