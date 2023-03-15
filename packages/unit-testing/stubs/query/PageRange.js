define([], function () {
    /**
     * PageRange object
     * @class PageRange
     * @classDescription Encapsulates the range of query results for a page.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function PageRange() {

        /**
         * Describes the array index for this page range.
         * @name PageRange#index
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.index = undefined;
        /**
         * Number of results in this page range
         * @name PageRange#size
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.size = undefined;
    }

    return new PageRange();
});