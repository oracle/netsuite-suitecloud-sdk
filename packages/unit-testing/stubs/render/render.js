define(['./EmailMergeResult', './TemplateRenderer'], function (EmailMergeResult, TemplateRenderer) {
    /**
     * SuiteScript module
     * The render module encapsulates functionality for printing, PDF creation, form creation from templates, and email creation from templates.
     *
     * @module N/render
     * @suiteScriptVersion 2.x
     *
     */
    var render = function () { };

    /**
     * Use this method to create a PDF or HTML object of a transaction.
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options The options object.
     * @param {number} options.entityId The internal ID of the transaction to print.
     * @param {string} [options.printMode] The print output type. Set using the render.PrintMode enum.
     * @param {number} [options.formId] The transaction form number.
     * @param {boolean} [options.inCustLocale] Applies when advanced templates are used. Print the document in the customer's locale.
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or entityId are undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If an argument type is not compatible.
     *
     * @return {File}
     *
     * @since 2015.2
     */
    render.prototype.transaction = function (options) { };

    /**
     * Use this method to create a PDF or HTML object of a statement.
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options The options object
     * @param {number} options.entityId The internal ID of the statement to print.
     * @param {string} [options.printMode] The print output type. Set using the render.PrintMode enum.
     * @param {number} [options.formId] Internal ID of the form to use to print the statement.
     * @param {boolean} [options.inCustLocale] Applies when advanced templates are used. Print the document in the customer's locale..
     * @param {Date} [options.startDate] Date of the oldest transaction to appear on the statement.
     * @param {Date} [options.statementDate] Statement date.
     * @param {boolean} [options.openTransactionsOnly] Include only open transactions.
     * @param {boolean} [options.consolidateStatements] Convert all amount values to the base currency.
     * @param {number} [options.subsidiaryId] Internal ID of transactions' subsidiary to appear on the statement.
     * @return {File}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If entityId is undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If an argument type is not compatible.
     *
     * @since 2015.2
     */
    render.prototype.statement = function (options) { };

    /**
     * Use this method to create a PDF or HTML object of a packing slip.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options The options object.
     * @param {number} options.entityId The internal ID of the packing slip to print.
     * @param {string} [options.printMode] The print output type. Set using the render.PrintMode enum.
     * @param {number} [options.formId] The packing slip form number.
     * @param {boolean} [options.inCustLocale] Applies when advanced templates are used. Print the document in the customer's locale..
     * @param {number} [options.fulfillmentId] Fulfillment ID number.
     * @return {File}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If entityId is undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If an argument type is not compatible.
     *
     * @since 2015.2
     */
    render.prototype.packingSlip = function (options) { };

    /**
     * Use this method to create a PDF or HTML object of a picking ticket.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options
     * @param {number} options.entityId The internal ID of the picking ticket to print.
     * @param {string} [options.printMode] The print output type. Set using the render.PrintMode enum.
     * @param {number} [options.formId] The picking ticket form number.
     * @param {boolean} [options.inCustLocale] Applies when advanced templates are used. Print the document in the customer's locale.
     * @param {number} [options.shipgroup] Shipping group for the ticket.
     * @param {number} [options.location] Location for the ticket.
     * @return {File}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If entityId is undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If an argument type is not compatible.
     *
     * @since 2015.2
     */
    render.prototype.pickingTicket = function (options) { };

    /**
     * Use this method to create a PDF or HTML object of a bill of material.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options The options object.
     * @param {number} options.entityId The internal ID of the bill of material to print.
     * @param {string} [options.printMode] The print output type. Set using the render.PrintMode enum.
     * @return {File}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If entityId is undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If an argument type is not compatible.
     *
     * @since 2015.2
     */
    render.prototype.bom = function (options) { };

    /**
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {number} options.entityId
     * @param {string} options.printMode (optional)
     * @param {boolean} options.printPerSubsidiary (optional)
     * @param {Object} options.subsidiaries (optional)
     * @param {Object} options.accountingBooks (optional)
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if entityId is undefined
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if an argument type is not compatible
     *
     * @return {File}
     *
     * @since 2020.2
     */
    render.prototype.glImpact = function (options) { };

    /**
     * Use this method to produce HTML and PDF printed forms with advanced PDF/HTML templates.
     * @restriction Server SuiteScript only
     * @governance none
     * @return {TemplateRenderer}
     *
     * @since 2015.2
     */
    render.prototype.create = function () { };

    /**
     * Method used to pass XML to the Big Faceless Organization (BFO) tag library (which is stored by NetSuite), and return a PDF file. BFO is used in NetSuite. For version details, see Third-Party Notices and Licenses.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options The option object.
     * @param {Document|string} options.xmlString XML document or string to convert to PDF.
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or xmlString are undefined.
     * @return {File}
     *
     * @since 2015.2
     */
    render.prototype.xmlToPdf = function (options) { };

    /**
     * Creates a render.EmailMergeResult object for a mail merge with an existing scriptable email template
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options The options object.
     * @param {number} options.templateId Internal ID of the template.
     * @param {RecordRef} options.entity Entity.
     * @param {RecordRef} options.recipient Recipient.
     * @param {RecordRef} options.customRecord Custom record.
     * @param {number} options.supportCaseId Support case ID.
     * @param {number} options.transactionId Transaction ID.
     * @return {EmailMergeResult}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter is undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If an argument type is not compatible.
     *
     * @since 2015.2
     */
    render.prototype.mergeEmail = function (options) { };

    /**
     * Holds the string values for supported print output types. Use this enum to set the options.printMode parameter.
     * @readonly
     * @enum {string}
     */
    function renderPrintMode() {
        this.PDF = 'PDF';
        this.HTML = 'HTML';
        this.DEFAULT = 'DEFAULT';
    }

    render.prototype.PrintMode = new renderPrintMode();

    /**
     * Holds the string values for supported data source types. Use this enum to set the options.format parameter.
     * @readonly
     * @enum {string}
     */
    function renderDataSource() {
        this.XML_DOC = 'XML_DOC';
        this.XML_STRING = 'XML_STRING';
        this.OBJECT = 'OBJECT';
        this.JSON = 'JSON';
    }

    render.prototype.DataSource = new renderDataSource();

    /**
     * @exports N/render
     * @namespace render
     */
    return new render();
});