define([], function () {
    /**
     * Returns a new instance of pgp.KeyId, which stores an octet scalar that identifies a (sub)key. This object is used for verification signatures.
     *
     * @class KeyId
     * @classdesc Encapsulation of a PGP key identifier.
     * @constructor
     * @protected
     *
     * @since 2022.2
     */
    function KeyId() {
        /**
         * Returns the key ID value as a hexadecimal string.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2022.2
         */
        this.asHex = function () { };

    }

    return new KeyId();
});
