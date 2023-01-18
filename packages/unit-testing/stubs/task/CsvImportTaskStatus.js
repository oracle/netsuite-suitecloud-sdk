define([], function () {
    /**
     * @class CsvImportTaskStatus
     * @classdesc Encapsulates the status of a CSV import task placed into the NetSuite scheduling queue.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function CsvImportTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name CsvImportTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.taskId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name CsvImportTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.status = undefined;
        /**
         * Returns the object type name (task.CsvImportTaskStatus).
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

    return new CsvImportTaskStatus();
});