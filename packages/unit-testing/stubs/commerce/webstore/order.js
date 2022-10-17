define([], function () {
    /**
     * Webstore sales order.
     *
     * @module N/commerce/webstore/order
     * @public
     * @NApiVersion 2.x
     *
     */
    var order = function () { };

    /**
     * Provides access to Sales Order record in session, if there isn't one it loads the Sales Order that was saved using
     * save().
     *
     * @governance none
     *
     * @param {Object} options
     * @param {function(Record)} options.onSuccess Callback to be called after successfully retrieving the Sales Order from
     *     session.
     * @param {function(RestoreErrorEventArgs): boolean} [options.onRestoreError] Callback to be called in case restoring
     *     state of some fields or sublists failed. The callback should handle such case. Truthy value shall be returned to
     *     indicate the sales order is usable and restore errors has been handled.
     * @param {function(Record)} options.onError Callback to be called in case of an error.
     *
     * @return {void}
     *
     * @since 2020.2
     */
    order.prototype.createOrLoad = function (options) { };

    /**
     * Updates a sales order object for current shopper.
     *
     * @governance none
     *
     * @param {Object} options
     * @param {Record} options.order Sales order record.
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.order is missing
     * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if options.order is not of N/record.Type.SALES_ORDER type.
     *
     * @return {void}
     *
     * @since 2020.2
     */
    order.prototype.save = function (options) { };

    /**
     * @exports N/commerce/webstore/order
     * @namespace order
     */
    return new order();
});