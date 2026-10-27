define(['./KeyId'], function (KeyId) {
    /**
     * Returns a new instance of pgp.VerificationSignature used to hold the verification result for one signature.
     *
     * @class VerificationSignature
     * @classdesc Stores a verification result for single signature.
     * @constructor
     * @protected
     *
     * @since 2022.2
     */
    function VerificationSignature() {
        /**
         * Indicates whether verification was successful for a signature.
         * @name VerificationSignature#verified
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.verified = undefined;

        /**
         * ID of the (sub)key that was used for signing.
         * @name VerificationSignature#keyId
         * @type {KeyId}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.keyId = undefined;

        /**
         * Date when the message was signed.
         * @name VerificationSignature#dateSigned
         * @type {Date}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.dateSigned = undefined;

        /**
         * List of problems for more fine-grained decision-making.
         * @name VerificationSignature#problems
         * @type {string[]}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.problems = undefined;

    }

    return new VerificationSignature();
});
