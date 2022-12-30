define(['../workbook/Expression', './DatasetLinkInstance', '../dataset/DatasetInstance'], function (Expression, DatasetLink, Dataset) {
    /**
     * SuiteScript datasetLink module
     * Create a DatasetLink object which can be constructed using multiple datasets and expression matrix.
     * Such object can be used in Pivot/Chart
     *
     * @module N/datasetLink
     * @suiteScriptVersion 2.x
     */
    var datasetLink = function () { };

    /**
     * Creates a dataset link
     * @governance none
     * @param {Object} options
     * @param {Array<Dataset>} options.datasets Datasets for this link
     * @param {Array<Array<Expression>>} options.expressions Mapping expressions
     * @param {string} options.id id of this dataset link
     * @return {DatasetLink}
     * @throws {SuiteScriptError} NO_DATASET_DEFINED when assigning empty array for datasets
     *
     * @since 2021.2
     */
    datasetLink.prototype.create = function (options) { }

    /**
     * @exports N/datasetLink
     * @namespace datasetLink
     */
    return new datasetLink();
});