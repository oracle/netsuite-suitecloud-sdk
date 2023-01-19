define([], function () {
    /**
     * @class WorkflowTriggerTask
     * @classdesc Encapsulates all the properties required to asynchronously initiate a workflow. Use WorkflowTriggerTask to create a task that initiates an instance of a specific workflow.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function WorkflowTriggerTask() {

        /**
         * The ID of the task.
         * @name WorkflowTriggerTask#id
         * @type {string}
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The record type of the workflow base record.
         * @name WorkflowTriggerTask#recordType
         * @type {string}
         *
         * @since 2015.2
         */
        this.recordType = undefined;
        /**
         * The internal ID of the base record.
         * @name WorkflowTriggerTask#recordId
         * @type {number}
         *
         * @since 2015.2
         */
        this.recordId = undefined;
        /**
         * The internal ID (int) or script ID (string) for the workflow definition. This is the ID that appears in the ID field on the Workflow Definition Page.
         * @name WorkflowTriggerTask#workflowId
         * @type {string | number}
         *
         * @since 2015.2
         */
        this.workflowId = undefined;
        /**
         * Key/value pairs which override static script parameter field values on the deployment.
         * Used to dynamically pass context to the script.
         * @name WorkflowTriggerTask#params
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
         *
         * @since 2015.2
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.WorkflowTriggerTask).
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

    return new WorkflowTriggerTask();
});