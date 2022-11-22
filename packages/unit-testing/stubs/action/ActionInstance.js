define([], function () {
    /**
     * @param {Object} options
     * @param {string=} options.recordId record instance ID
     */
    function Action(options) {

        /**
         * The action description.
         * @name Action#description
         * @type string
         */
        this.description = undefined;

        /**
         * The ID of the action.
         * @name Action#id
         * @type string
         */
        this.id = undefined;

        /**
        * 	The action label.
        * @name Action#label
        * @type string
        */
        this.label = undefined;

        /**
         * The action parameters.
         * @name Action#parameters
         * @type Object
         */
        this.parameters = undefined;

        /**
        * The type of the record on which the action is to be performed.
        * @name Action#recordType
        * @type string
        */
        this.recordType = undefined;

        this.promise = function (options) { };

        /**
         * Executes the record action and returns the action results in a plain JavaScript object.
         * If the action fails, it is listed in the results object’s notifications property. If the action executes successfully, the notifications property is usually empty.
         *
         * @governance 50 units for timesheets, 10 for transactions, 2 for custom records, 5 for all other records
         *
         * @param {Object} options
         * @param {string} options.recordType record type
         * @param {string} options.id action ID
         * @param {Params} options.params action arguments
         * @return {Object} action result; the actual return value returned by the action implementation is stored in the response property
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordType or options.id or options.params.recordId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if the specified record type doesn't exist
         * @throws {SuiteScriptError} SSS_INVALID_ACTION_ID if the specified action doesn't exist on the said record type
         * @throws {SuiteScriptError} RECORD_DOES_NOT_EXIST if the specified record instance doesn't exist
         *
         * @since 2018.2
         */
        this.execute = function (options) { };
        this.execute.promise = function (options) { };

        /**
         * Executes an asynchronous bulk record action and returns its task ID for status queries. The options.params parameter
         * is mutually exclusive to options.condition and options.paramCallback.
         *
         * @governance 50 units
         *
         * @param {Object} options
         * @param {string} options.recordType record type
         * @param {string} options.id action ID
         * @param {Array<Params>} options.params array of parameter objects; each object corresponds to one record ID for which the action is to
         *                                             be executed; the object has the following form: {recordId: 1, someParam: 'foo', otherParam: 'bar'}
         *                                             recordId is always mandatory, other parameters are optional and specific to the particular action
         * @param {string=} options.condition condition used to select record IDs for which the action is to be executed; only the
         *                                              action.ALL_QUALIFIED_INSTANCES constant is supported at the moment
         * @param {string=} options.paramCallback function that takes record ID and returns the parameter object for the given record ID
         * @return {string} task ID used in a later call to getBulkStatus
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordType or options.id is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if the specified record type doesn't exist
         * @throws {SuiteScriptError} SSS_INVALID_ACTION_ID if the specified action doesn't exist on the said record type
         * @throws {SuiteScriptError} RECORD_DOES_NOT_EXIST if the specified record instance doesn't exist
         *
         * @since 2019.1
         */
        this.executeBulk = function (options) { };

        /**
         * Returns the current status of a bulk execution with the given task ID.
         *
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.taskId a task ID that was returned by a previous call to executeBulk
         * @return {RecordActionTaskStatus} a status object capturing the current state of the bulk action execution; see task module JSDoc
         *
         * @since 2019.1
         */
        this.getBulkStatus = function (options) { };
    }

    return new Action();
});
