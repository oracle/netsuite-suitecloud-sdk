define(['../workbook/Expression', '../dataset/DatasetInstance'], function (Expression, Dataset) {
    /**
     * @class DatasetLink
     * @classDescription Object representing SuiteAnalytics DatasetLink - multiple datasets linked by expressions matrix
     * @constructor
     * @protected
     *
     * @since 2021.2
     */
    function DatasetLink() {

        /**
         * id of the dataset link
         * @name DatasetLink#id
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
         *
         * @since 2021.2
         */
        this.id = undefined;
        /**
         * datasets of the link
         * @name DatasetLink#datasets
         * @type {Array<Dataset>}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when assigning something else than Array<Dataset>
         * @throws {SuiteScriptError} NO_DATASET_DEFINED when assigning empty array
         *
         * @since 2021.2
         */
        this.datasets = undefined;
        /**
         * Mapping expressions
         * @name DatasetLink#expressions
         * @type {Array<Array<Expression>>}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when assigning something else than Array<Array<Expression>>
         *
         * @since 2021.2
         */
        this.expressions = undefined;
        /**
         * Returns the object type name (datasetLink.DatasetLink)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2021.2
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

    return new DatasetLink();
});