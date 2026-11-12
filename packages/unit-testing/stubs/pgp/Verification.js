define(['./VerificationSignature'], function (VerificationSignature) {
    /**
     * Returns a new instance of pgp.Verification used to hold PGP signature verification results.
     *
     * @class Verification
     * @classdesc Stores PGP verification results.
     * @constructor
     * @protected
     *
     * @since 2022.2
     */
    function Verification() {
        /**
         * Indicates whether verification succeeded.
         * @name Verification#verified
         * @type {boolean|null}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.verified = undefined;

        /**
         * List of individual verifications, one per each signature.
         * @name Verification#signatures
         * @type {VerificationSignature[]|null}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.signatures = undefined;

    }

    return new Verification();
});
