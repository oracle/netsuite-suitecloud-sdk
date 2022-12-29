/**
 * SuiteScript module
 * The render module encapsulates functionality for printing, PDF creation, form creation from templates, and email creation from templates.
 *
 * @module N/render
 * @suiteScriptVersion 2.x
 *
 */
define([], function(){        
    /**
     * @namespace render
     */    
    var render = {};    
        
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
    render.transaction = function(options) {};    
    
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
    render.statement = function(options) {};    
    
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
    render.packingSlip = function(options) {};    
    
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
    render.pickingTicket = function(options) {};    
    
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
    render.bom = function(options) {};    
    
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
    render.glImpact = function(options) {};    
    
    /**
     * Use this method to produce HTML and PDF printed forms with advanced PDF/HTML templates.
     * @restriction Server SuiteScript only
     * @governance none
     * @return {TemplateRenderer}
     *
     * @since 2015.2
     */    
    render.create = function() {};    
    
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
    render.xmlToPdf = function(options) {};    
    
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
    render.mergeEmail = function(options) {};    
    
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
     * @class EmailMergeResult
     * @description Encapsulates an email merge result.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */    
    function EmailMergeResult() {    
        
        /**
         * The subject of the email distribution in string format.
         * @name EmailMergeResult#subject
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted.
         * @since 2015.2
         */        
        this.subject = undefined;        
        /**
         * The body of the email distribution in string format.
         * @name EmailMergeResult#body
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted.
         *
         * @since 2015.2
         */        
        this.body = undefined;        
        /**
         * Get JSON format of the object.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */        
        this.toJSON = function() {};        
        
        /**
         * Returns the object type name (render.EmailMergeResult)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */        
        this.toString = function() {};        
    }    
        
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
        this.setTemplateByScriptId = function(options) {};        
        
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
        this.setTemplateById = function(options) {};        
        
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
        this.addRecord = function(options) {};        
        
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
        this.addSearchResults = function(options) {};        
        
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
        this.addQuery = function(options) {};        
        
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
        this.addCustomDataSource = function(options) {};        
        
        /**
         * Return template content in string form.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */        
        this.renderAsString = function() {};        
        
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
        this.renderToResponse = function(options) {};        
        
        /**
         * Uses the advanced template to produce a PDF printed form
         * @restriction Server SuiteScript only
         * @governance none
         * @return {File}
         *
         * @since 2015.2
         */        
        this.renderAsPdf = function() {};        
        
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
        this.renderPdfToResponse = function(options) {};        
        
        /**
         * Get JSON format of the object.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         * @since 2015.2
         */        
        this.toJSON = function() {};        
        
        /**
         * Returns the object type name (render.TemplateRenderer)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */        
        this.toString = function() {};        
    }    
        
    /**
     * RecordRef Encapsulates the type and id of a particular record instance.
     * @typedef {Object} RecordRef
     * @property {number} id - Internal ID of the record instance.
     * @property {string} type - Record type id.
     */    
    function RecordRefTypedef() {    
    }    
    
    N.render = render;
    
    /**
     * @exports N/render
     */
    return render;
});