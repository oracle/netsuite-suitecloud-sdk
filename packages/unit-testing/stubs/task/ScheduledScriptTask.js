define([], function () {
    /**
     * @class ScheduledScriptTask
     * @classdesc Encapsulates all the properties of a scheduled script task in SuiteScript. Use this object to place a scheduled script deployment into the NetSuite scheduling queue.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function ScheduledScriptTask() {

        /**
         * The ID of the task.
         * @name ScheduledScriptTask#id
         * @type {string}
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The Internal ID or Script ID of the Script record.
         * @name ScheduledScriptTask#scriptId
         * @type {string | number}
         *
         * @since 2015.2
         */
        this.scriptId = undefined;
        /**
         * The Internal ID or Script ID of the Script Deployment record.
         * @name ScheduledScriptTask#deploymentId
         * @type {string | number}
         *
         * @since 2015.2
         */
        this.deploymentId = undefined;
        /**
         * Key/value pairs which override static script parameter field values on the deployment.
         * Used to dynamically pass context to the script.
         * @name ScheduledScriptTask#params
         * @type {Object}
         *
         * @since 2015.2
         */
        this.params = undefined;
        /**
         * Submits the task and returns an unique ID.
         * @restriction Server SuiteScript only
         * @governance 20 units
         *
         * @return {string} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT scriptId property was not set
         *
         * @since 2015.2
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.ScheduledScriptTask)
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

    return new ScheduledScriptTask();
});