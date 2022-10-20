define(['./Page', './PageRange'], function (Page, PageRange) {
    /**
     * Object for handling paged queries
     * @class PagedData
     * @classDescription Encapsulates a set of paged query results. This object also contains information about the set of paged results it encapsulates.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function PagedData() {

        /**
         * Get page with given index
         * @param {Object} options
         * @param {string} options.index Index of page to return
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if options are undefined
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE if options isn't object nor number
         * @governance 10 units
         *
         * @return {Page}
         */
        this.fetch = function (options) { };
        this.fetch.promise = function (options) { };

        /**
         * Standard object for iterating through pages.
         * @governance 10 units for each page returned
         * @return {Iterator}
         *
         * @since 2018.1
         */
        this.iterator = function () { };

        /**
         * Size of the page
         * @name PageData#pageSize
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.pageSize = undefined;
        /**
         * Total number of results
         * @name PagedData#count
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.count = undefined;
        /**
         * Metadata Provider used during execution
         * @name PagedData#metadataProvider
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2022.1
         */
        this.metadataProvider = undefined;
        /**
         * PageRanges of PagedData
         * @name PagedData#pageRanges
         * @type {Array<PageRange>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.pageRanges = undefined;
        /**
         * Returns the object type name (query.PagedData)
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
         * @since 2018.1
         */
        this.toJSON = function () { };
    }

    return new PagedData();
});
