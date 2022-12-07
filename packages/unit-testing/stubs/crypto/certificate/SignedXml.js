define([], function () {
    /**
     * @class SignedXml
     * @classdesc Result of xml signing
     * @protected
     * @constructor
     */
    function SignedXml() {

        /**
         * Returns signed xml as string
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2019.2
         */
        this.asString = function () { };

        /**
         * Returns signed xml as file
         * @restriction Server SuiteScript only
         * @governance none
         * @return {File}
         *
         * @since 2019.2
         */
        this.asFile = function () { };

        /**
         * Returns signed xml as Document
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Document}
         *
         * @since 2019.2
         */
        this.asXml = function () { };

        /**
         * Return the object type name (certificate.SignedXml).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2019.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2019.2
         */
        this.toJSON = function () { };
    }
    return new SignedXml();
});