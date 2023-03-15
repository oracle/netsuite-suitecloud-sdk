define(['./CipherPayload'], function (CipherPayload) {
    /**
     * @class Cipher
     * @classDescription Encapsulates a cipher.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Cipher() {

        /**
         * Method used to update the clear data with the specified encoding.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.input The clear data to be updated.
         * @param {string} [options.inputEncoding] The input encoding.
         * @return {void}
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
         *
         * @since 2015.2
         */
        this.update = function (options) { };

        /**
         * Method used to return the cipher data.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} [options.outputEncoding] The output encoding for a crypto.CipherPayload object.
         * @return {CipherPayload}
         *
         * @since 2015.2
         */
        this['final'] = function (options) { };

        /**
         * Returns the object type name (crypto.Cipher)
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

    return new Cipher();
});