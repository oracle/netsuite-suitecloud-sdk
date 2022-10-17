define([], function () {
    /**
     * @class
     * @classdesc Encapsulates an hmac.
     * @return {Hmac}
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Hmac() {

        /**
         * Method used to update the clear data with the encoding specified.
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.input The hmac data to be updated.
         * @param {string} [options.inputEncoding] The input encoding. Set using the encode.Encoding enum. The default value is UTF_8.
         * @return {void}
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
         *
         * @since 2015.2
         */
        this.update = function (options) { };

        /**
         * Method used to update the clear data with the encoding specified.
         * @governance none
         * @param {Object} options The hmac data to be updated.
         * @param {string} [options.outputEncoding] The input encoding. Set using the encode.Encoding enum. The default value is UTF_8.
         * @return {string}
         * @since 2015.2
         */
        this.digest = function (options) { };

        /**
         * Returns the object type name (crypto.Hash)
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

    return new Hmac();
}); 