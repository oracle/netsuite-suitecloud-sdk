define(['./Parser', './XPath', './Node', './Document'], function (Parser, XPath, Node, Document) {
    /**
     * SuiteScript xml module
     *
     * @module N/xml
     * @NApiVersion 2.x
     *
     */
    var xml = function () {};

    /**
     * Prepares a String for use in XML by escaping XML markup (for example, angle brackets, quotation marks, and ampersands).
     * @governance none
     * @param {Object} options
     * @param {string} options.xmlText the XML text to be escaped
     * @return {string} the escaped XML
     *
     * @since 2015.2
     */
    xml.prototype.escape = function (options) { };

    /**
     * Validates a supplied XML document against a supplied XML Schema (XSD Document).
     * @governance none
     * @param {Object} options
     * @param {Document} options.xml the XML document object
     * @param {number|string} options.xsdFilePathOrId ID or path to the XSD file to validate the XML object against
     * @param {number|string} options.importFolderPathOrId (optional) ID or path to a folder in the file cabinet containing additional XSD schemas which are imported by the parent XSD provided via "xsdFilePathOrId"
     * @throws {SuiteScriptError} SSS_XML_DOES_NOT_CONFORM_TO_SCHEMA if XML provided is invalid with respect to the provided schema
     * @throws {SuiteScriptError} SSS_INVALID_XML_SCHEMA_OR_DEPENDENCY if schema is an incorrectly structured XSD, or a dependent schema could not be found
     * @return {void}
     *
     * @since 2015.2
     */
    xml.prototype.validate = function (options) { };

    /**
     * XML Parser Object
     *
     * @type {Parser}
     */
    xml.prototype.Parser = undefined;
    /**
     * XPath Query Object
     *
     * @type {XPath}
     */
    xml.prototype.XPath = undefined;
    /**
     * @enum {string}
     * @readonly
     */
    function xmlNodeType() {
        this.ELEMENT_NODE = 'ELEMENT_NODE';
        this.ATTRIBUTE_NODE = 'ATTRIBUTE_NODE';
        this.TEXT_NODE = 'TEXT_NODE';
        this.CDATA_SECTION_NODE = 'CDATA_SECTION_NODE';
        this.ENTITY_REFERENCE_NODE = 'ENTITY_REFERENCE_NODE';
        this.ENTITY_NODE = 'ENTITY_NODE';
        this.PROCESSING_INSTRUCTION_NODE = 'PROCESSING_INSTRUCTION_NODE';
        this.COMMENT_NODE = 'COMMENT_NODE';
        this.DOCUMENT_NODE = 'DOCUMENT_NODE';
        this.DOCUMENT_TYPE_NODE = 'DOCUMENT_TYPE_NODE';
        this.DOCUMENT_FRAGMENT_NODE = 'DOCUMENT_FRAGMENT_NODE';
        this.NOTATION_NODE = 'NOTATION_NODE';
    }

    xml.prototype.NodeType = new xmlNodeType();

    /**
     * @exports N/xml
     * @namespace xml
     */
    return new xml();
});