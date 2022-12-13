define([], function () {
    /**
     * @class Hash
     * @classdesc Encapsulation of a Hash
     * @constructor
     * @protected
     *
     * @since 2015.2
     */
    function Hash() {

        /**
         * Method used to update clear data with the encoding specified.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.input The data to be updated.
         * @param {string} [options.inputEncoding] The input encoding. Set using the encode.Encoding enum.
         * @return {void}
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if options or required parameters are undefined
         *
         * @since 2015.2
         */
        this.update = function (options) { };

        /**
         * Calculates the digest of the data to be hashed.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} [options.outputEncoding] The output encoding. Set using the encode.Encoding enum.
         * @return {string}
         *
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

    return new Hash();
});