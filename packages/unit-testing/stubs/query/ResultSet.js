define(['./Iterator', './Column'], function (Iterator, Column) {
    /**
     * Set of results returned by the query.
     * @class ResultSet
     * @classDescription Encapsulates the set of results returned by the query. Use Query.run() or Query.run.promise() to create this object.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function ResultSet() {

        /**
         * Standard SuiteScript 2.0 object for iterating through results
         * @governance 10 units for each page returned
         * @return {Iterator}
         *
         * @since 2018.1
         */
        this.iterator = function () { };

        /**
         * Standard SuiteScript 2.0 object for iterating through results
         * @return {Array<Object>}
         *
         * @since 2018.1
         */
        this.asMappedResults = function () { };

        /**
         * Holds an array of query.Result objects.
         * @name ResultSet#results
         * @type {Array<Result>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.results = undefined;
        /**
         * Holds an array of the return types for ResultSet.results.
         * @name ResultSet#types
         * @type {Array<string>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.types = undefined;
        /**
         * Holds an array of query return column references. The ResultSet.columns array values correspond with the ResultSet.types array values.
         * @name ResultSet#columns
         * @type {Array<Column>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.columns = undefined;
        /**
         * Returns type of the column associated with given alias
         * @param {Object} options
         * @param {string} options.alias
         * @governance none
         * @return {string}
         * @throws {SuiteScriptError} CANNOT_DETERMINE_TYPE_FOR_ALIAS if alias was not found or type information is not available
         * @throws {SuiteScriptError} SSS_DUPLICATE_ALIAS if more columns in the result set have the same alias
         *
         * @since 2020.2
         */
        this.getTypeForAlias = function (options) { };

        /**
         * Holds name of metadata provider type used during execution.
         * @name ResultSet#metadataProvider
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2022.1
         */
        this.metadataProvider = undefined;
        /**
         * Returns the object type name (query.ResultSet)
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

    return new ResultSet();
});