define([], function () {
    /**
     * @class MapReduceScriptTaskStatus
     * @classdesc Encapsulates the status of a map/reduce script deployment that has been submitted for processing.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function MapReduceScriptTaskStatus() {

        /**
         * The taskId associated with the specified task.
         * @name MapReduceScriptTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.taskId = undefined;
        /**
         * Script ID.
         * @name MapReduceScriptTaskStatus#scriptId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.scriptId = undefined;
        /**
         * Script deployment ID.
         * @name MapReduceScriptTaskStatus#deploymentId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.deploymentId = undefined;
        /**
         * Represents the task status. Returns one of the task.TaskStatus enum values.
         * @name MapReduceScriptTaskStatus#status
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.status = undefined;
        /**
         * Represents the current stage of the Map/Reduce script. Returns one of the task.MapReduceStage enum values.
         * @name MapReduceScriptTaskStatus#stage
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.stage = undefined;
        /**
         * Get percentage of completion for the current stage. Note that INPUT and SUMMARIZE are either 0% or 100% complete at any given time.
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPercentageCompleted = function () { };

        /**
         * Total number of records/rows not yet processed by the MAP phase.
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPendingMapCount = function () { };

        /**
         * Total number of record/row inputs to the MAP phase.
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getTotalMapCount = function () { };

        /**
         * Total number of bytes not yet processed by the MAP phase (a component of total size).
         * @restriction Server SuiteScript only
         * @governance 25 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPendingMapSize = function () { };

        /**
         * Total number of records/rows not yet processed by the REDUCE phase.
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPendingReduceCount = function () { };

        /**
         * Total number of record/row inputs to the REDUCE phase.
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getTotalReduceCount = function () { };

        /**
         * Total number of bytes not yet processed by the REDUCE phase (a component of total size).
         * @restriction Server SuiteScript only
         * @governance 25 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPendingReduceSize = function () { };

        /**
         * Total number of records/rows not yet iterated by the script.
         *
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPendingOutputCount = function () { };

        /**
         * Returns the total size in bytes of all key/value pairs written as output (a component of total size).
         * @restriction Server SuiteScript only
         * @governance 25 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getPendingOutputSize = function () { };

        /**
         * Total number of record/row inputs to the OUTPUT phase.
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {number}
         *
         * @since 2015.2
         */
        this.getTotalOutputCount = function () { };

        /**
         * Returns the total size in bytes of all stored work in progress.
         * @restriction Server SuiteScript only
         * @governance 25 units
         * @returns {number}
         *
         * @since 2015.2
         */
        this.getCurrentTotalSize = function () { };

        /**
         * Returns the object type name (task.MapReduceScriptTaskStatus).
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

    return new MapReduceScriptTaskStatus();
});