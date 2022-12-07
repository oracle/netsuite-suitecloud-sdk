define(['./Attr', './Element'], function (Attr, Element) {
    /**
     * Return a new instance of XML Document.
     * @class Document
     * @classDescription Encapsulation of W3C DOM Document
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
     function Document() {

        /**
         * Attempts to adopt a node from another document to this document. If supported, it changes the ownerDocument
         * of the source node, its children, as well as the attached attribute nodes if there are any. If the source
         * node has a parent it is first removed from the child list of its parent.
         * @governance none
         * @param {Object} options
         * @param {Node} options.source the node to move into this document
         * @return {Node} the adopted node, or null if this operation fails, such as when the source node comes from a different implementation
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the node cannot be adopted for some reason
         *
         * @since 2015.2
         */
        this.adoptNode = function (options) { };

        /**
         * Creates an attribute node of the given name.
         * @governance none
         * @param {Object} options
         * @param {string} options.name the name of the attribute
         * @param {string} options.value (optional) the value of the attribute; if omitted, the value of the attribute will be empty string
         * @return {Attr} new attribute node object with name and attribute value set as expected and localName, prefix, and namespaceURI set to null
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be created
         */
        this.createAttribute = function (options) { };

        /**
         * Creates an attribute of the given qualified name and namespace URI.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the attribute to create; can be null
         * @param {string} options.qualifiedName the qualified name of the attribute to instantiate
         * @param {string} options.value (optional) the value of the attribute; if omitted, the value of the attribute will be empty string
         * @return {Attr} new attribute node object with name, attribute value, namespaceURI, prefix and localName set accordingly
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be created
         *
         * @since 2015.2
         */
        this.createAttributeNS = function (options) { };

        /**
         * Creates a CDATASection node whose value is the specified string.
         * @governance none
         * @param {Object} options
         * @param {string} options.data the data for the CDATASection contents
         * @return {Node} the new CDATASection node
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the CDATASection node cannot be created
         *
         * @since 2015.2
         */
        this.createCDATASection = function (options) { };

        /**
         * Creates a Comment node given the specified string.
         * @governance none
         * @param {Object} options
         * @param {string} options.data the data for the node
         * @return {Node} the new Comment node
         *
         * @since 2015.2
         */
        this.createComment = function (options) { };

        /**
         * Creates an empty DocumentFragment object.
         * @governance none
         * @return {Node} a new DocumentFragment
         *
         * @since 2015.2
         */
        this.createDocumentFragment = function () { };

        /**
         * Creates an element of the type specified.
         * @governance none
         * @param {Object} options
         * @param {string} options.tagName the name of the element type to instantiate; for XML, this is case-sensitive
         * @return {Element} a new Element object with the nodeName attribute set to tagName, and localName, prefix, and namespaceURI set to null
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the Element node cannot be created
         *
         * @since 2015.2
         */
        this.createElement = function (options) { };

        /**
         * Creates an element of the given qualified name and namespace URI.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the element to create; can be null
         * @param {string} options.qualifiedName the qualified name of the element type to instantiate
         * @return {Element} a new Element object with the nodeName, localName, prefix, and namespaceURI set accordingly
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the Element node cannot be created
         *
         * @since 2015.2
         */
        this.createElementNS = function (options) { };

        /**
         * Creates a ProcessingInstruction node given the specified name and data strings.
         * @governance none
         * @param {Object} options
         * @param {string} options.target the target part of the processing instruction
         * @param {string} options.data the data for the node
         * @return {Node} the new ProcessingInstruction object
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the ProcessingInstruction node cannot be created
         *
         * @since 2015.2
         */
        this.createProcessingInstruction = function (options) { };

        /**
         * Creates a Text node given the specified string.
         * @governance none
         * @param {Object} options
         * @param {string} options.data the data for the node
         * @return {Node} the new Text node
         *
         * @since 2015.2
         */
        this.createTextNode = function (options) { };

        /**
         * Returns the Element that has an ID attribute with the given value. If no such element exists, this returns null.
         * @governance none
         * @param {Object} options
         * @param {string} options.elementId the unique id value for an element
         * @return {Element} the matching Element or null if there is none
         *
         * @since 2015.2
         */
        this.getElementById = function (options) { };

        /**
         * Returns an array of all the Elements with a given tag name in document order.
         * @governance none
         * @param {Object} options
         * @param {string} options.tagName the name of the tag to match on; the special value "*" matches all tags; for XML, the tagName parameter is case-sensitive
         * @return {Array<Element>} an array containing all the matched Elements
         *
         * @since 2015.2
         */
        this.getElementsByTagName = function (options) { };

        /**
         * Returns an array of all the Elements with a given local name and namespace URI in document order.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the elements to match on; the special value "*" matches all namespaces
         * @param {string} options.localName the local name of the elements to match on; the special value "*" matches all local names
         * @return {Array<Element>} an array containing all the matched Elements
         *
         * @since 2015.2
         */
        this.getElementsByTagNameNS = function (options) { };

        /**
         * Imports a node from another document to this document, without altering or removing the source node from the original document;
         * this method creates a new copy of the source node.
         * @governance none
         * @param {Object} options
         * @param {Node} options.importedNode the node to import
         * @param {boolean} options.deep if true, recursively import the subtree under the specified node; if false, import only the node itself, as explained above
         * @return {Node} the imported node that belongs to this Document
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the node cannot be imported for some reason
         *
         * @since 2015.2
         */
        this.importNode = function (options) { };

        /**
         * The Document Type Declaration associated with this document.
         * @name Document#doctype
         * @type {Element}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.doctype = undefined;
        /**
         * This is a convenience attribute that allows direct access to the child node that is the document element of the document.
         * @name Document#documentElement
         * @type {Element}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.documentElement = undefined;
        /**
         * The location of the document or null if undefined.
         * @name Document#documentURI
         * @type {string}
         *
         * @since 2015.2
         */
        this.documentURI = undefined;
        /**
         * An attribute specifying the encoding used for this document at the time of the parsing.
         * @name Document#inputEncoding
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.inputEncoding = undefined;
        /**
         * An attribute specifying, as part of the XML declaration, the encoding of this document.
         * @name Document#xmlEncoding
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.xmlEncoding = undefined;
        /**
         * An attribute specifying, as part of the XML declaration, whether this document is standalone. This is false when unspecified.
         * @name Document#xmlStandalone
         * @type {boolean}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the property cannot be set
         *
         * @since 2015.2
         */
        this.xmlStandalone = undefined;
        /**
         * An attribute specifying, as part of the XML declaration, the version number of this document.
         * @name Document#xmlVersion
         * @type {string}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the property cannot be set
         *
         * @since 2015.2
         */
        this.xmlVersion = undefined;
        /**
         * Returns the object type name (xml.Document)
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    return new Document();
});