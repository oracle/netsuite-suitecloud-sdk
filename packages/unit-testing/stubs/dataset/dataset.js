define(['../workbook/Expression', './DatasetInstance', './Join', './Column', './Condition'], function (Expression, Dataset, Join, Column, Condition) {
    /**
     * SuiteScript dataset module
     * Create/Load a dataset and execute it using the SuiteAnalytics Workbook query engine. Or use it as a data source for the workbook
     * itself.
     *
     * @module N/dataset
     * @suiteScriptVersion 2.x
     */
    var dataset = function () { };

    /**
     * Create a Dataset join
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.fieldId
     * @param {string=} options.source - for inverse joins
     * @param {string=} options.target - for polymorphic joins
     * @param  {Join=}  options.join - for multi-level joins
     * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS when both source and target parameters are specified
     * @return {Join}
     *
     * @since 2020.2
     */
    dataset.prototype.createJoin = function (options) { }

    /**
     * Create a Dataset object
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.type Record type on which to build the dataset
     * @param {Condition} [options.condition] Dataset's condition
     * @param {Array<Column>} [options.columns] Dataset's columns
     * @throws {SuiteScriptError} INVALID_SEARCH_TYPE when the type is invalid
     * @return {Dataset}
     *
     * @since 2020.2
     */
    dataset.prototype.create = function (options) { }

    /**
     * Loads a dataset
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.id id of the dataset to load
     * @return {Dataset}
     *
     * @since 2020.2
     */
    dataset.prototype.load = function (operator) { }

    /**
     * Creates a dataset column
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} [options.formula] formula for the column
     * @param {string} [options.type] return type of the formula
     * @param {string} [options.fieldId] fieldId for the column (exclusive with formula/type)
     * @param {string|Expression} [options.label] label for the column to display in UI
     * @param {string} [options.alias] Alias for the column which can be used to get corresponding expression for the column,
     *     which can later be used in a workbook, also used in results mapping
     * @param {Join} options.join join record on which the field is present
     * @throws {SuiteScriptError} INVALID_FORMULA_TYPE when invalid formula return type was entered
     * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS when both formula and fieldId parameters are specified, or both
     *     formula and join are specified
     * @return {Column}
     *
     * @since 2020.2
     */
    dataset.prototype.createColumn = function (options) { }

    /**
     * Creates a Dataset condition
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {Column=} options.column column to apply this filter on
     * @param {string} options.operator filter's operator
     * @param {Array<string | number | boolean | Date | Object>=} options.values
     * @param {Array<Condition>} options.children child conditions (when AND/OR operator is used)
     * @throws {SuiteScriptError} INVALID_OPERATOR if invalid operator is used
     * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS when both column and children parameters are specified
     * @return {Condition}
     *
     * @since 2020.2
     */
    dataset.prototype.createCondition = function (operator) { }

    /**
     * Create translation expression
     * @param {Object} options
     * @param {string} {options.key} Key of the translation
     * @param {string} {options.collection} Collection of the translation
     * @return {Expression} Expression for the translation
     *
     * @since 2021.2
     */
    dataset.prototype.createTranslation = function (options) { }

    /**
     * Describes a dataset. Returns name, description and list of columns/formulas with their labels and types
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.id id of the dataset to describe
     * @return {Array<Object>}
     *
     * @since 2021.1
     */
    dataset.prototype.describe = function () { }

    dataset.prototype.list = function () { }

    dataset.prototype.listPaged = function (options) { }

    /**
     * @exports N/dataset
     * @namespace dataset
     */
    return new dataset();
});