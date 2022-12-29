define([], function () {
    /**
     * @class RecordActionTask
     * @classdesc Encapsulates the properties of a record action task. Use this object to place a record action task into the NetSuite scheduling queue.
     * @protected
     * @constructor
     *
     * @since 2019.1
     */
    function RecordActionTask() {

        /**
         * The ID of the task.
         * @name RecordActionTask#id
         * @type {string}
         *
         * @since 2019.1
         */
        this.id = undefined;
        /**
         * The record type of on which the action is to be invoked.
         * @name RecordActionTask#recordType
         * @type {string}
         *
         * @since 2019.1
         */
        this.recordType = undefined;
        /**
         * The ID of the action to be invoked.
         * @name RecordActionTask#action
         * @type {number}
         *
         * @since 2019.1
         */
        this.action = undefined;
        /**
         * Array of parameter objects. Each parameter object contains a mandatory recordId property and any number of other
         * properties that will be passed as action parameters when the action is invoked on the record with that record ID.
         * @name RecordActionTask#params
         * @type {Array<Object>}
         *
         * @since 2019.1
         */
        this.params = undefined;
        /**
         * Condition used to get the record instance IDs. Currently only task.ActionCondition.ALL_QUALIFIED_INSTANCES
         * is supported. This parameter is mutually exclusive with params.
         * @name RecordActionTask#condition
         * @type {Object}
         *
         * @since 2019.1
         */
        this.condition = undefined;
        /**
         * Function that generates a parameter object for a given ID. To be used in conjunction with condition.
         * Cannot be specified when params is specified.
         * @name RecordActionTask#paramCallback
         * @type {Function}
         *
         * @since 2019.1
         */
        this.paramCallback = undefined;
        /**
         * Submits the task and returns an unique ID.
         * @restriction Server SuiteScript only
         * @governance 50 units
         *
         * @returns {string} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         *
         * @since 2019.1
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.RecordActionTask).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2019.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2019.1
         */
        this.toJSON = function () { };
    }

    return new RecordActionTask();
});