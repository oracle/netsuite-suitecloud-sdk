define([], function () {
    /**
     * @class EmailMergeResult
     * @description Encapsulates an email merge result.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function EmailMergeResult() {

        /**
         * The subject of the email distribution in string format.
         * @name EmailMergeResult#subject
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted.
         * @since 2015.2
         */
        this.subject = undefined;
        /**
         * The body of the email distribution in string format.
         * @name EmailMergeResult#body
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted.
         *
         * @since 2015.2
         */
        this.body = undefined;
        /**
         * Get JSON format of the object.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name (render.EmailMergeResult)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new EmailMergeResult();
});