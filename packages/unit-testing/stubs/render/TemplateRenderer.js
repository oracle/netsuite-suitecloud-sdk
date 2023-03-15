define([], function () {
    /**
     * @class TemplateRenderer
     * @description Encapsulates a template engine object that produces HTML and PDF printed forms utilizing advanced PDF/HTML template capabilities.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function TemplateRenderer() {

        /**
         * Template content
         * @name TemplateRenderer#templateContent
         * @type {string}
         *
         * @since 2015.2
         */
        this.templateContent = undefined;
        /**
         * Sets the template using the script ID.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.scriptId
         * @return {void}
         *
         * @since 2015.2
         */
        this.setTemplateByScriptId = function (options) { };

        /**
         * Sets the template using the internal ID.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {number} options.id Internal ID of the template.
         * @return {void}
         *
         * @since 2015.2
         */
        this.setTemplateById = function (options) { };

        /**
         * Binds a record to a template variable.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object
         * @param {string} options.templateName Name of the record object variable referred to in the template.
         * @param {Record} options.record The record to add.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options are undefined
         * @return {void}
         *
         * @since 2015.2
         */
        this.addRecord = function (options) { };

        /**
         * Binds a record to a template variable.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.templateName
         * @param {Result} options.searchResult
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If a required argument is missing.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If searchResult is not a search.Result object.
         * @return {void}
         *
         * @since 2015.2
         */
        this.addSearchResults = function (options) { };

        /**
         * Adds a SuiteAnalytics Workbook query to use as the renderer’s data source.
         * @restriction Server SuiteScript only
         * @governance Subsequent rendering will cost additional 5 units per query load and another 10 units per query run
         *
         * @param {Object} options The options object.
         * @param {string} options.templateName Name of the results iterator variable referred to in the template.
         * @param {string} options.id Workbook query ID.
         * @param {number} options.pageSize Page size. The minimum value is 5, and the maximum value is 1000.
         * @param {number} options.pageIndex Page index.
         * @param {Query} options.query Workbook query definition.
         * @return {void}
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options are undefined.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object, id/templateName isn't string or query isn't a query.Query object.
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS When two mutually arguments are defined.
         * @throws {SuiteScriptError} NEITHER_ARGUMENT_DEFINED When neither of mandatory arguments (query,id) is defined.
         *
         * @since 2019.2
         */
        this.addQuery = function (options) { };

        /**
         * Adds XML or JSON as custom data source to an advanced PDF/HTML template.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {DataSource} options.format Data format.
         * @param {string} options.alias Data source alias.
         * @param {Object|Document|string} options.data Object, document or string.
         * @return {void}
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If a required argument is missing.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If invalid format value is provided.
         *
         * @since 2015.2
         */
        this.addCustomDataSource = function (options) { };

        /**
         * Return template content in string form.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.renderAsString = function () { };

        /**
         * Writes template content to a server response.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options The options object.
         * @param {ServerResponse} options.response Response to write to.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If 'response' argument is missing.
         * @return {void}
         *
         * @since 2015.2
         */
        this.renderToResponse = function (options) { };

        /**
         * Uses the advanced template to produce a PDF printed form
         * @restriction Server SuiteScript only
         * @governance none
         * @return {File}
         *
         * @since 2015.2
         */
        this.renderAsPdf = function () { };

        /**
         * Renders a server response into a PDF file.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {ServerResponse} response Response that will be written to PDF. For example, the response passed from a Suitelet.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if response argument is missing.
         * @return {void}
         *
         * @since 2015.2
         */
        this.renderPdfToResponse = function (options) { };

        /**
         * Get JSON format of the object.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name (render.TemplateRenderer)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new TemplateRenderer();
});