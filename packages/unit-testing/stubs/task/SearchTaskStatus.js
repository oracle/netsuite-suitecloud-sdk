define([], function () {
    /**
     * Represents the status of a search task
     * @protected
     * @constructor
     */
    function SearchTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name SearchTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2017.1
         */
        this.taskId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name SearchTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.status = undefined;
        /**
         * Represents the fileId of exported file.
         * @name SearchTaskStatus#fileId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2017.1
         */
        this.fileId = undefined;
        /**
         * Represents id of saved search being used for export.
         * @name SearchTaskStatus#savedSearchId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2017.1
         */
        this.savedSearchId = undefined;
        /**
         * Returns the object type name (task.SearchTaskStatus).
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
    }

    return new SearchTaskStatus();
});