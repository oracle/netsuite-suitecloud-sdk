define([], function () {
    /**
     * @class Decipher
     * @classDescription Encapsulates a decipher. This object has methods that decrypt.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Decipher() {

        /**
         * Method used to update cipher data with the specified encoding.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.input The data to update.
         * @param {string} [options.inputEncoding] Specifies the encoding of the input data.
         * @return {void}
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
         *
         * @since 2015.1
         */
        this.update = function (options) { };

        /**
         * Method used to return the clear data.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object
         * @param {string} [options.outputEncoding] Specifies the encoding for the output
         * @return {string}
         *
         * @since 2015.2
         */
        this['final'] = function (options) { };

        /**
         * Returns the object type name (crypto.Decipher)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.1
         */
        this.toJSON = function () { };
    }

    return new Decipher();
});