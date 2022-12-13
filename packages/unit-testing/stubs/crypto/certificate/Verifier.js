define([], function () {
    /**
         * @class Verifier
         * @classdesc Class for verifying string signatures
         * @protected
         * @constructor
         */
    function Verifier() {

        /**
         * Updates string to be verified against specified certificate
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.input string to verify
         * @param {string} [options.inputEncoding] encoding of string to verify - default is UTF-8
         * @return {void}
         *
         * @since 2019.2
         */
        this.update = function (options) { };

        /**
         * Verifies string against provided signature using specified certificate
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.signature signature to be verified
         * @param {string} [options.signatureEncoding] signature's encoding - default is Base64
         * @return {void}
         * @throws {SuiteScriptError} INVALID_SIGNATURE when signature is invalid
         *
         * @since 2019.2
         */
        this.verify = function (options) { };

        /**
         * Return the object type name (certificate.Verifier).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2020.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.2
         */
        this.toJSON = function () { };
    }

    return new Verifier();
});