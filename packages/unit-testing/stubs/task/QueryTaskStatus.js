define([], function () {
    /**
     * Represents the status of a query task
     * @protected
     * @constructor
     */
    function QueryTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name QueryTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.taskId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name QueryTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.status = undefined;
        /**
         * Represents the fileId of exported file.
         * @name QueryTaskStatus#fileId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.fileId = undefined;
        /**
         * Represents query being used for the task execution
         * @name QueryTaskStatus#query
         * @type {query}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.query = undefined;
        /**
         * Returns the object type name (task.QueryTaskStatus).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
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
    }

    return new QueryTaskStatus();
});