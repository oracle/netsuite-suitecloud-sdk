define([], function () {
    /**
     * @class Signer
     * @classdesc Class for signing certificates
     * @protected
     * @constructor
     */
    function Signer() {

        /**
         * Updates the input string to be signed. The string can be encoded.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.input The string to update.
         * @param {string} [options.inputEncoding] Encoding of the string to sign (for example, UTF-8, ISO_8859_1, ASCII). The default value is UTF-8.
         * @return {void}
         *
         * @since 2019.2
         */
        this.update = function (options) { };


        /**
        * Signs the string and returns the signature. Formatting, such as line breaks, is disabled in signatures.
        * @restriction Server SuiteScript only
        * @governance none
        *
        * @param {Object} options
        * @param {string} [options.outputEncoding] Encoding of the signed string in Base64 format.
        * @return {void}
        *
        * @since 2019.2
        */
        this.sign = function (options) { };
    }

    return new Signer();
});