define([], function () {
    /**
     * SuiteScript currency module
     *
     * @module N/currency
     * @NApiVersion 2.x
     *
     */
    var currency = function () { };

    /**
     * Retrieves the exchange rate between two currencies based on the specified date.
     * The return value comes from the Exchange Rate column of the Currency Exchange Rates record.
     * @governance 10 units
     *
     * @param {Object} options
     * @param {number|string} options.source The source currency ID or String
     * @param {number|string} options.target The target currency ID or String
     * @param {Date} options.date [optional] The date of the desired effective currency rate. Defaults to today.
     *
     * @return {number}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if id parameter is missing
     * @throws {SuiteScriptError} SSS_INVALID_CURRENCY_ID if an invalid currency (source or target) is specified
     *
     * @since 2015.2
     */
    currency.prototype.exchangeRate = function (options) { };
    currency.prototype.exchangeRate.promise = function (options) { };

    /**
     * @exports N/currency
     * @namespace currency
     */
    return new currency();
});