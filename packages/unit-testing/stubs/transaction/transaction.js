define([], function () {
    /**
     * SuiteScript transaction common module
     *
     * @module N/transaction
     * @suiteScriptVersion 2.x
     *
     */
    var transaction = function () { };

    /**
     * Void a transaction record object based on provided type, id
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.type record type to be voided
     * @param {number|string} options.id record id to be voided
     * @return {number} the id is the voided record or new reverse journal entry based on preference
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if type or id is missing
     * @throws {SuiteScriptError} INVALID_RCRD_TYPE if type is not voidable
     * @throws {SuiteScriptError} RCRD_DSNT_EXIST if record does not exist
     *
     * @since 2015.2
     */
    transaction.prototype['void'] = function (options) { };
    transaction.prototype['void'].promise = function (options) { };

    function transactionType() {
        this.ASSEMBLY_BUILD = 'assemblybuild';
        this.ASSEMBLY_UNBUILD = 'assemblyunbuild';
        this.BIN_TRANSFER = 'bintransfer';
        this.BIN_WORKSHEET = 'binworksheet';
        this.BLANKET_PURCHASE_ORDER = 'blanketpurchaseorder';
        this.CASH_REFUND = 'cashrefund';
        this.CASH_SALE = 'cashsale';
        this.CHECK = 'check';
        this.CREDIT_CARD_CHARGE = 'creditcardcharge';
        this.CREDIT_CARD_REFUND = 'creditcardrefund';
        this.CREDIT_MEMO = 'creditmemo';
        this.CUSTOMER_DEPOSIT = 'customerdeposit';
        this.CUSTOMER_PAYMENT = 'customerpayment';
        this.CUSTOMER_PAYMENT_AUTHORIZATION = 'customerpaymentauthorization';
        this.CUSTOMER_REFUND = 'customerrefund';
        this.DEPOSIT = 'deposit';
        this.DEPOSIT_APPLICATION = 'depositapplication';
        this.ESTIMATE = 'estimate';
        this.EXPENSE_REPORT = 'expensereport';
        this.FULFILLMENT_REQUEST = 'fulfillmentrequest';
        this.INBOUND_SHIPMENT = 'inboundshipment';
        this.INVENTORY_ADJUSTMENT = 'inventoryadjustment';
        this.INVENTORY_COST_REVALUATION = 'inventorycostrevaluation';
        this.INVENTORY_COUNT = 'inventorycount';
        this.INVENTORY_STATUS_CHANGE = 'inventorystatuschange';
        this.INVENTORY_TRANSFER = 'inventorytransfer';
        this.INVOICE = 'invoice';
        this.ITEM_FULFILLMENT = 'itemfulfillment';
        this.ITEM_RECEIPT = 'itemreceipt';
        this.JOURNAL_ENTRY = 'journalentry';
        this.OPPORTUNITY = 'opportunity';
        this.ORDER_RESERVATION = 'orderreservation';
        this.PAYCHECK = 'paycheck';
        this.PAYCHECK_JOURNAL = 'paycheckjournal';
        this.PERIOD_END_JOURNAL = 'periodendjournal';
        this.PURCHASE_CONTRACT = 'purchasecontract';
        this.PURCHASE_ORDER = 'purchaseorder';
        this.PURCHASE_REQUISITION = 'purchaserequisition';
        this.RETURN_AUTHORIZATION = 'returnauthorization';
        this.REVENUE_ARRANGEMENT = 'revenuearrangement';
        this.REVENUE_COMMITMENT = 'revenuecommitment';
        this.REVENUE_COMMITMENT_REVERSAL = 'revenuecommitmentreversal';
        this.SALES_ORDER = 'salesorder';
        this.STORE_PICKUP_FULFILLMENT = 'storepickupfulfillment';
        this.TRANSFER_ORDER = 'transferorder';
        this.VENDOR_BILL = 'vendorbill';
        this.VENDOR_CREDIT = 'vendorcredit';
        this.VENDOR_PAYMENT = 'vendorpayment';
        this.VENDOR_PREPAYMENT = 'vendorprepayment';
        this.VENDOR_PREPAYMENT_APPLICATION = 'vendorprepaymentapplication';
        this.VENDOR_RETURN_AUTHORIZATION = 'vendorreturnauthorization';
        this.WORK_ORDER = 'workorder';
        this.WORK_ORDER_CLOSE = 'workorderclose';
        this.WORK_ORDER_COMPLETION = 'workordercompletion';
        this.WORK_ORDER_ISSUE = 'workorderissue';
        this.WAVE = 'wave';
    }

    transaction.prototype.Type = new transactionType();

    /**
     * @exports N/transaction
     * @namespace transaction
     */
    return new transaction();
});