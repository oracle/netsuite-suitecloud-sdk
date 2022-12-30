define(['../workbook/Expression', './Condition', './Column', '../query/PagedData', '../query/ResultSet'], function (Expression, Condition, Column, PagedData, ResultSet) {
    /**
     * @class Dataset
     * @classDescription Object representing SuiteAnalytics dataset
     * @constructor
     * @protected
     *
     * @since 2020.2
     */
    function Dataset() {

        /**
         * Executes the dataset and returns the result set (the same as in query module)
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string} options.metadataProvider
         * @return {ResultSet}
         *
         * @since 2020.2
         */
        this.run = function (options) { };
        this.run.promise = function (options) { };

        /**
         * Executes the dataset and returns paginated data (the same as in query module)
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {number} options.pageSize
         * @param {string} options.metadataProvider
         * @return {PagedData}
         *
         * @since 2020.2
         */
        this.runPaged = function (options) { };
        this.runPaged.promise = function (options) { };

        /**
         * Returns expression which can be used in workbook
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {number} options.columnId
         * @param {string} options.alias
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS both columnId and alias are used
         * @throws {SuiteScriptError} NEITHER_ARGUMENT_DEFINED neither columnId nor alias parameters are defined
         * @return {Expression}
         *
         * @since 2020.2
         */
        this.getExpressionFromColumn = function (options) { };

        /**
         * Saves the dataset
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string|Expression} options.name name of the dataset
         * @param {string|Expression} [options.description] decription of the dataset
         * @param {string} [options.id] target id for the saved dataset
         * @throws {SuiteScriptError} INVALID_ID_PREFIX when desired dataset id does not start with 'custdataset'
         * @return {Object}
         *
         * @since 2020.2
         */
        this.save = function (options) { };

        /**
         * Condition for the whole dataset (criterion)
         * @name Dataset#condition
         * @type {Condition}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when assigning something else than dataset.Condition
         *
         * @since 2020.2
         */
        this.condition = undefined;
        /**
         * id of the dataset
         * @name Dataset#id
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when assigning something else than string
         *
         * @since 2020.2
         */
        this.id = undefined;
        /**
         * Columns in the dataset
         * @name Dataset#columns
         * @type {Array<Column>}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when assigning something else than Array<dataset.Column>
         *
         * @since 2020.2
         */
        this.columns = undefined;
        /**
         * base record type
         * @name Dataset#type
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when assigning something else than string
         * @throws {SuiteScriptError} INVALID_SEARCH_TYPE when the type is invalid
         *
         * @since 2020.2
         */
        this.type = undefined;
        /**
         * Name of the dataset
         * @name Dataset#name
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.name = undefined;
        /**
         * Description of the dataset
         * @name Dataset#description
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.description = undefined;
        /**
         * Returns the object type name (dataset.Dataset)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2020.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.2
         */
        this.toJSON = function () { };
    }

    return new Dataset();
});