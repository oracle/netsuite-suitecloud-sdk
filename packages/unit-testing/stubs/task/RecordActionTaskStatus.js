define([], function () {
    function RecordActionTaskStatus() {

        /**
         * @name RecordActionTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.taskId = undefined;

        /**
         * @name RecordActionTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.status = undefined;

        /**
         * @name RecordActionTaskStatus#complete
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.complete = undefined;

        /**
         * @name RecordActionTaskStatus#failed
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.failed = undefined;

        /**
         * @name RecordActionTaskStatus#pending
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.pending = undefined;

        /**
         * @name RecordActionTaskStatus#succeeded
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.succeeded = undefined;

        /**
         * @name RecordActionTaskStatus#errors
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.errors = undefined;

        /**
         * @name RecordActionTaskStatus#results
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.results = undefined;

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

    return new RecordActionTaskStatus();
});