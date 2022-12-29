define([], function () {
    /**
     * @class MapReduceScriptTask
     * @classdesc Encapsulates a map/reduce script deployment.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function MapReduceScriptTask() {

        /**
         * The ID of the task.
         * @name MapReduceScriptTask#id
         * @type {string}
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The Internal ID or Script ID of the Script record.
         * @name MapReduceScriptTask#scriptId
         * @type {string | number}
         *
         * @since 2015.2
         */
        this.scriptId = undefined;
        /**
         * The Internal ID or Script ID of the Script Deployment record.
         * @name MapReduceScriptTask#deploymentId
         * @type {string | number}
         *
         * @since 2015.2
         */
        this.deploymentId = undefined;
        /**
         * Key/value pairs which override static script parameter field values on the deployment.
         * Used to dynamically pass context to the script.
         * @name MapReduceScriptTask#params
         * @type {Object}
         *
         * @since 2015.2
         */
        this.params = undefined;
        /**
         * Submits the task and returns an unique ID.
         * @restriction Server SuiteScript only
         * @governance 20 units
         * @return {string} taskId
         *
         * @since 2015.2
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.MapReduceScriptTask).
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

    return new MapReduceScriptTask();
});