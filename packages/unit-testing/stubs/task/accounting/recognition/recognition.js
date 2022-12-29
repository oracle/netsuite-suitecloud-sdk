/**
 * SuiteScript module
 *
 * @module N/task/accounting/recognition
 * @NApiVersion 2.x
 *
 */
define([], function(){        
    /**
     * @namespace recognition
     */    
    var recognition = {};    
        
    /**
     * Creates a task of the given type and returns the task object.
     *
     * @governance 50 units
     *
     * @param {Object} options
     * @param {string} options.taskType specifies the type of task to be created; use values from the task.TaskType enum
     * @returns {task.MergeRevenueArrangementsTask | task.MergeRevenueElementsTask }
     */    
    recognition.create = function(options) {};    
    
    /**
     * Check current status of a submitted recognition task. The task to be checked is identified by its ID that was returned from the create function.
     *
     * @governance 10 units
     *
     * @param {string | number} taskId
     * @param {string} options.taskId
     * @returns {task.MergeArrangementsTaskStatus}
     */    
    recognition.checkStatus = function(options) {};    
    
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
     * @protected
     * Common validator function for input arrangement and element Ids
     */    
    function validateNumericInputArray() {    
    }    
        
    /**
     * @protected
     * @constructor
     */    
    function MergeArrangementsTask() {    
        
        /**
         * An array containing the record internal IDs of the revenue arrangements to process.
         * It is mandatory to specify a value for this field.
         * @name MergeArrangementsTask#arrangements
         * @type {Array<number> | Array<string>}
         */        
        this.arrangements = undefined;        
        /**
         * The date on the new revenue arrangement.
         * Initial Value: today
         * @name MergeArrangementsTask#revenueArrangementDate
         * @type {date}
         */        
        this.revenueArrangementDate = undefined;        
        /**
         * To indicate whether to prospectively merge the arrangements or not.
         * Initial Value: false
         * @name MergeArrangementsTask#mergeResidualRevenueAmounts
         * @type {boolean}
         */        
        this.mergeResidualRevenueAmounts = undefined;        
        /**
         * To indicate whether to recalculate the fair value on the residual elements when the arrangements are prospectively merged. This can only be set to true if mergeResidualRevenueAmounts is also set to true.
         * @name MergeArrangementsTask#recalculateResidualFairValue
         * @type {boolean}
         */        
        this.recalculateResidualFairValue = undefined;        
        /**
         * * When the accounting preference Enable Advanced Cost Amortization is on, this is the Contract cost acquisition expense account on the merged arrangement.
         * Initial Value: the account specified by the "Contract Acquisition Expense Account" accounting preference
         * @name MergeArrangementsTask#contractAcquisitionExpenseAccount
         * @type {number | string}
         */        
        this.contractAcquisitionExpenseAccount = undefined;        
        /**
         *  When Advanced Cost Amortization is enabled, holds the Contract Acquisition Deferred Expense Account to use when creating the new revenue arrangement.
         * Initial Value: the account specified by the "Contract Acquisition Deferred Expense Account" accounting preference
         * @name MergeArrangementsTask#contractAcquisitionDeferredExpenseAccount
         * @type {number | string}
         */        
        this.contractAcquisitionDeferredExpenseAccount = undefined;        
        /**
         * When Advanced Cost Amortization is enabled, holds the Contract Cost Accrual date to use when creating the new revenue arrangement.
         * Initial Value: today
         * @name MergeArrangementsTask#contractCostAccrualDate
         * @type {date}
         */        
        this.contractCostAccrualDate = undefined;        
        /**
         * Submits the task and returns an unique ID.
         *
         * @governance 20 units
         *
         * @returns {String} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         */        
        this.submit = function() {};        
        
        /**
         * Returns the object type name (task.MergeArrangementsTask).
         *
         * @returns {string}
         */        
        this.toString = function() {};        
        
        /**
         * JSON.stringify() implementation.
         *
         * @returns {Object}
         */        
        this.toJSON = function() {};        
    }    
        
    /**
     * @protected
     * @constructor
     */    
    function MergeElementsTask() {    
        
        /**
         * An array containing the record internal IDs of the revenue elements to process.
         * It is mandatory to specify a value for this field.
         * @name MergeElementsTask#elements
         * @type {Array<number> | Array<string>}
         */        
        this.elements = undefined;        
        /**
         * The date on the new revenue arrangement.
         * Initial Value: today
         * @name MergeElementsTask#revenueArrangementDate
         * @type {date}
         */        
        this.revenueArrangementDate = undefined;        
        /**
         * * When the accounting preference Enable Advanced Cost Amortization is on, this is the Contract cost acquisition expense account on the merged arrangement.
         * Initial Value: the account specified by the "Contract Acquisition Expense Account" accounting preference
         * @name MergeElementsTask#contractAcquisitionExpenseAccount
         * @type {number | string}
         */        
        this.contractAcquisitionExpenseAccount = undefined;        
        /**
         *  When Advanced Cost Amortization is enabled, holds the Contract Acquisition Deferred Expense Account to use when creating the new revenue arrangement.
         * Initial Value: the account specified by the "Contract Acquisition Deferred Expense Account" accounting preference
         * @name MergeElementsTask#contractAcquisitionDeferredExpenseAccount
         * @type {number | string}
         */        
        this.contractAcquisitionDeferredExpenseAccount = undefined;        
        /**
         * When Advanced Cost Amortization is enabled, holds the Contract Cost Accrual date to use when creating the new revenue arrangement.
         * Initial Value: today
         * @name MergeElementsTask#contractCostAccrualDate
         * @type {date}
         */        
        this.contractCostAccrualDate = undefined;        
        /**
         * Submits the task and returns an unique ID.
         *
         * @governance 20 units
         *
         * @returns {String} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         */        
        this.submit = function() {};        
        
        /**
         * Returns the object type name (task.MergeElementsTask).
         *
         * @returns {string}
         */        
        this.toString = function() {};        
        
        /**
         * JSON.stringify() implementation.
         *
         * @returns {Object}
         */        
        this.toJSON = function() {};        
    }    
        
    /**
     * @protected
     * @constructor
     */    
    function MergeArrangementsTaskStatus() {    
        
        /**
         * The taskId associated with the specified task.
         * @name MergeArrangementsTaskStatus#taskId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.taskId = undefined;        
        /**
         * Merge Arrangements Bulk Process submission ID
         * @name MergeArrangementsTaskStatus#submissionId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.submissionId = undefined;        
        /**
         * Represents the merge process status. Returns one of the task.TaskStatus enum values.
         * @name MergeArrangementsTaskStatus#status
         *
         * @governance 20 units
         *
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.status = undefined;        
        /**
         * Returns an array of internal record IDs of Revenue Arrangement records passed in as input.
         * @name MergeArrangementsTaskStatus#arrangements
         *
         * @governance 10 units
         *
         * @type {Array<number>}
         */        
        this.inputArrangements = undefined;        
        /**
         * Array of Revenue Elements internal IDs that were passed as input arrangements.
         * @name MergeArrangementsTaskStatus#elements
         *
         * @governance 10 units
         *
         * @type {Array<number>}
         */        
        this.inputElements = undefined;        
        /**
         * Once the Task Status is Completed, returns the internal record ID of the Revenue Arrangement which got created
         *
         * @governance 10 units
         *
         * @name MergeArrangementsTaskStatus#resultingArrangement
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.resultingArrangement = undefined;        
        /**
         * If the process status is FAILED, this will hold an error message explaining the failure.
         * @name MergeArrangementsTaskStatus#errorMessage
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.errorMessage = undefined;        
        /**
         * Returns the object type name (task.MergeArrangementsTaskStatus).
         *
         * @returns {string}
         */        
        this.toString = function() {};        
        
        /**
         * JSON.stringify() implementation.
         *
         * @returns {Object}
         */        
        this.toJSON = function() {};        
    }    
    
    var task = {};
N.task = task;
    var accounting = {};
task.accounting = accounting;
    accounting.recognition = recognition;
    
    /**
     * @exports N/task/accounting/recognition
     */
    return recognition;
});