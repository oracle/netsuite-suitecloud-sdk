define([], function () {
    /**
     * Represents the status of a SuiteQL task
     * @protected
     * @constructor
     */
    function SuiteQLTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name SuiteQLTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.taskId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name SuiteQLTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.status = undefined;
        /**
         * Represents the fileId of exported file.
         * @name SuiteQLTaskStatus#fileId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.fileId = undefined;
        /**
         * Represents SuiteQL query being used for the task execution
         * @name SuiteQLTaskStatus#query
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.query = undefined;
        /**
         * Represents SuiteQL query parameters used for the task execution
         * @name SuiteQLTaskStatus#params
         * @type {Array<string>|Array<boolean>|Array<number>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.params = undefined;
        /**
         * Returns the object type name (task.SuiteQLTaskStatus).
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

    return new SuiteQLTaskStatus();
});