define(['./CurrencyFormatter', './NumberFormatter'], function (CurrencyFormatter, NumberFormatter) {
    /**
     * SuiteScript format/i18n module
     *
     * @module N/format/i18n
     * @NApiVersion 2.x
     *
     */
    var i18n = function () { };

    /**
     * @param {Object} options The options object.
     * @param {number} options.number
     * @param {string} options.locale
     * @return {string}
     */
    i18n.prototype.spellOut = function (options) { }

    /**
     * @param {Object} options The options object.
     * @param {string} options.currency
     * @param {string} options.locale
     * @return {CurrencyFormatter}
     */
    i18n.prototype.getCurrencyFormatter = function (options) { }

    /**
     * @param {Object} options The options object.
     * @param {string} options.groupSeparator
     * @param {string} options.decimalSeparator
     * @param {number} options.presicion
     * @param {string} options.negativeNumberFormat
     * @param {string} options.locale
     * @return {NumberFormatter}
     */
    i18n.prototype.getNumberFormatter = function (options) { }

    /**
     * Holds the values for the negative number format.
     * @enum {string}
     * @readonly
     */
    function negativeNumberFormat() {
        this.BRACKETS = 'BRACKETS';
        this.MINUS = 'MINUS';
    }

    i18n.prototype.NegativeNumberFormat = new negativeNumberFormat();

    /**
     * Holds the values for the currency code.
     * @enum {string}
     * @readonly
     */
    function currencyCode() {
        this.USD = 'USD';
        this.CAD = 'CAD';
        this.EUR = 'EUR';
        this.GBP = 'GBP';
        this.JPY = 'JPY';
    }

    i18n.prototype.currency = new currencyCode(); 

    /**
     * @exports N/format/i18n
     * @namespace i18n
     */
    return new i18n();
});