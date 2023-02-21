define(['./MergeArrangementsTask', './MergeElementsTask', './MergeArrangementsTaskStatus'], function (MergeArrangementsTask, MergeElementsTask, MergeArrangementsTaskStatus) {
    /**
     * SuiteScript module
     *
     * @module N/task/accounting/recognition
     * @NApiVersion 2.x
     *
     */
    var recognition = function () { };

    /**
     * Creates a task of the given type and returns the task object.
     *
     * @governance 50 units
     *
     * @param {Object} options
     * @param {string} options.taskType specifies the type of task to be created; use values from the task.TaskType enum
     * @return {MergeArrangementsTask | MergeElementsTask }
     */
    recognition.prototype.create = function (options) { };

    /**
     * Check current status of a submitted recognition task. The task to be checked is identified by its ID that was returned from the create function.
     *
     * @governance 10 units
     *
     * @param {string | number} taskId
     * @param {string} options.taskId
     * @return {MergeArrangementsTaskStatus}
     */
    recognition.prototype.checkStatus = function (options) { };

    /**
     * @enum
     */
    function recognitionTaskType() {
        this.MERGE_ARRANGEMENTS_TASK = 'MERGE_ARRANGEMENTS_TASK';
        this.MERGE_ELEMENTS_TASK = 'MERGE_ELEMENTS_TASK';
    }

    recognition.prototype.TaskType = new recognitionTaskType();

    /**
     * @enum
     */
    function recognitionTaskStatus() {
        this.PENDING = 'PENDING';
        this.PROCESSING = 'PROCESSING';
        this.COMPLETE = 'COMPLETE';
        this.FAILED = 'FAILED';
    }

    recognition.prototype.TaskStatus = new recognitionTaskStatus();

    /**
     * @exports N/task/accounting/recognition
     * @namespace recognition
     */
    return new recognition();
});