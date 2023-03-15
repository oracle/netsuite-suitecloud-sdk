define(['./NumberFormatter'], function (NumberFormatter) {
    function CurrencyFormatter() {
        /**
         * @name CurrencyFormatter#currency
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.currency = undefined;
        /**
         * @name CurrencyFormatter#locale
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.locale = undefined;
        /**
         * @name CurrencyFormatter#symbol
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.symbol = undefined;
        /**
         * @name CurrencyFormatter#numberFormatter
         * @type {NumberFormatter}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.numberFormatter = undefined;
        /**
         * @param {Object} options
         * @param {number} options.number Number to be formatted
         *
         * @return {string}
         */
        this.format = function (options) { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @governance none
         * @return {string}
         */
        this.toString = function () { };
    }

    return new CurrencyFormatter();
});