define(['./PagedData', './PageRange'], function (PagedData, PageRange) {
    /**
     * Object corresponding to one page of results
     * @class Page
     * @classDescription One page of the paged query results.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Page() {

        /**
         * ResultSet of the page
         * @name Page#data
         * @type {ResultSet}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.data = undefined;
        /**
         * References the query results contained in this page.
         * @name QueryPage#pagedData
         * @type {PagedData}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.pagedData = undefined;
        /**
         * The range of query results for this page.
         * @name QueryPage#pageRange
         * @type {PageRange}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.pageRange = undefined;
        /**
         * Indicates whether the page is the first of the paged query results.
         * @name Page#isFirst
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.isFirst = undefined;
        /**
         * Indication whether this page is the last one
         * @name Page#isLast
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.isLast = undefined;
        /**
         * Returns the object type name (query.Page)
         * @governance none
         * @return {string}
         *
         * @since 2018.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2020.1
         */
        this.toJSON = function () { };
    }

    return new Page();
});