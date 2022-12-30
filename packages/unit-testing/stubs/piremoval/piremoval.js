define(['./PiRemovalTask', './PiRemovalTaskStatus'], function (PiRemovalTask, PiRemovalTaskStatus) {
    /**
     * SuiteScript module
     *
     * @module N/piremoval
     * @NApiVersion 2.x
     *
     */
    var piremoval = function () { };

    /**
     * @param {Object} options
     * @param {number[]} options.fieldIds
     * @param {boolean} options.historyOnly
     * @param {string} options.historyReplacement
     * @param {number[]} options.recordIds
     * @param {string} options.recordType
     * @param {number[]} options.workflowIds
     * @return {PiRemovalTask}
     */
    piremoval.prototype.createTask = function (options) { };

    /**
     * 
     * @param {Object} options
     * @param {number} options.id
     * @return {void}
     */
    piremoval.prototype.deleteTask = function (options) { };

    /**
     * 
     * @param {Object} options
     * @param {number} options.id
     * @return {PiRemovalTaskStatus}
     */
    piremoval.prototype.getTaskStatus = function (options) { };

    /**
     * 
     * @param {Object} options
     * @param {number} options.id
     * @return {PiRemovalTask}
     */
    piremoval.prototype.loadTask = function (options) { };

    /**
     * Enum status values.
     * @readonly
     * @enum {string}
     */
    function piremovalStatus() {
        this.CREATED = 'CREATED';
        this.PENDING = 'PENDING';
        this.COMPLETE = 'COMPLETE';
        this.ERROR = 'ERROR';
        this.DELETED = 'DELETED';
        this.NOT_APPLIED = 'NOT_APPLIED';
    }

    piremoval.prototype.Status = new piremovalStatus();

    /**
     * @exports N/piremoval
     * @namespace piremoval
     */
    return new piremoval();
});