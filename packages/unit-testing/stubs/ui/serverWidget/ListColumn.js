define([], function () {
    /**
     * @class ListColumn
     * @classdesc Encapsulates a list column
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function ListColumn() {

        /**
         * Adds a URL parameter (optionally defined per row) to the list column's URL
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.param  Name for the parameter
         * @param {string} options.value  Value for the parameter
         * @param {boolean} [options.dynamic]  If true, then the parameter value is actually an alias that is calculated per row
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when param or value parameter is missing
         *
         * @since 2015.2
         */
        this.addParamToURL = function (options) { };

        /**
         * @name ColumnList#label This list column label.
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * Sets the base URL for the list column
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.url  The base url or a column in the data source that returs the
         * base url for each row
         * @param {boolean} [options.dynamic] If true, then the URL is actually an alias that is calculated per row
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when url parameter is missing
         *
         * @since 2015.2
         */
        this.setURL = function (options) { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new ListColumn();
});