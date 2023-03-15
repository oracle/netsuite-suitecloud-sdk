define([], function() {
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
        this.submit = function () { };

        /**
         * Returns the object type name (task.MergeArrangementsTask).
         *
         * @returns {string}
         */
        this.toString = function () { };

        /**
         * JSON.stringify() implementation.
         *
         * @returns {Object}
         */
        this.toJSON = function () { };
    }
    
    return new MergeArrangementsTask();
});