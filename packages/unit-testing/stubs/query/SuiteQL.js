define(['./Column', './PagedData'], function (Column, PagedData) {
    /**
     * @class SuiteQL
     * @classDescription Object representing query in SuiteQL
     * @constructor
     * @protected
     *
     * @since 2018.2
     */
     function SuiteQL() {

        /**
         * String representation of SuiteQL
         * @name SuiteQL#query
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.2
         */
        this.query = undefined;
        /**
         * Parameters
         * @name SuiteQL#params
         * @type {Array<string|number|boolean>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.2
         */
        this.params = undefined;
        /**
         * Corresponding columns, if SuiteQL was created using toSuiteQL method
         * @name SuiteQL#columns
         * @type {Column[]}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.2
         */
        this.columns = undefined;
        /**
         * Execute the query and return results.
         * @governance 10 units
         * @param {Object} options the options object
         * @param {string} options.metadataProvider
         * @return {ResultSet} the result set object
         *
         * @since 2018.2
         */
        this.run = function (options) { };
        this.run.promise = function (options) { };

        /**
         * Execute the suiteQL query and return paged results.
         * @governance 10 units
         * @param {Object} options the options object
         * @param {Number} options.pageSize
         * @param {string} options.metadataProvider
         * @return {PagedData} the paged query object
         *
         * @since 2018.2
         */
        this.runPaged = function (options) { };
        this.runPaged.promise = function (options) { };

        /**
         * Returns the object type name (query.Columns)
         * @governance none
         * @return {string}
         *
         * @since 2018.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2018.2
         */
        this.toJSON = function () { };
    }

    return new SuiteQL();
});