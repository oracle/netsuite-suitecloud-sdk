define([], function () {
    /**
     * Corresponds to a single row of the ResultSet.
     * @class Result
     * @classDescription Encapsulates a single row of the result set (query.ResultSet).
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Result() {

        /**
         * Returns the query result as a mapped result. A mapped result is a JavaScript object with key-value pairs. In this object, the key is either the field ID or the alias that was used for the corresponding query.Column object.
         * @return {Object}
         *
         * @since 2019.2
         */
        this.asMap = function () { };

        /**
         * Returns value associated with given alias
         * @param {Object} options
         * @param {string} options.alias
         * @governance none
         * @return {string|number|boolean}
         * @throws {SuiteScriptError} CANNOT_DETERMINE_VALUE_FOR_ALIAS if alias was not found
         * @throws {SuiteScriptError} SSS_DUPLICATE_ALIAS if more columns in the result set have the same alias
         *
         * @since 2020.2
         */
        this.getValueForAlias = function (options) { };

        /**
         * Describes the result values. Value types correspond to the ResultSet.types property. Array values correspond to the array values for ResultSet.columns.
         * @name Result#values
         * @type {Array<string>|Array<number>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.values = undefined;
        /**
         * Returns the object type name (query.Result)
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

    return new Result();
});