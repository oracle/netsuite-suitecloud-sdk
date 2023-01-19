define([], function () {
    /**
     * SuiteScript workflow module
     *
     * @module N/workflow
     * @NApiVersion 2.x
     *
     */
    var workflow = function () { };

    /**
     * Triggers a workflow on a record.
     * @governance 20 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.recordType Record type ID of the workflow base record
     * @param {number|string} options.recordId Internal ID of the base record
     * @param {number|string} options.workflowId Internal ID or script ID of the workflow definition
     * @param {number|string} [options.defaultValues] Object containing key/value pairs providing default values for field defined on the specified workflow
     * @return {number} Internal ID of workflow instance that was initiated
     *
     * @since 2015.2
     */
    workflow.prototype.initiate = function (options) { };

    /**
     * Triggers a workflow on a record.
     * @governance 20 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.recordType Record type ID of the workflow base record
     * @param {number|string} options.recordId Internal ID of the base record
     * @param {number|string} options.workflowId Internal ID or script ID for the workflow definition
     * @param {number|string} [options.workflowInstanceId] Internal ID of the workflow instance
     * @param {number|string} [options.actionId] Internal ID or script ID of the workflow action (usually button pressed)
     * @param {number|string} [options.stateId] Internal ID or script ID of the workflow state containing the action
     * @return {number} Internal ID of workflow instance that was triggered
     *
     * @since 2015.2
     */
    workflow.prototype.trigger = function (options) { };

    /**
     * @exports N/workflow
     * @namespace workflow
     */
    return new workflow();
});