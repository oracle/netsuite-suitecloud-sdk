define(['./Document'], function (Document) {
    /**
     * Return a new instance of XML Node.
     * @class Node
     * @classDescription Encapsulation of W3C DOM Node
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
     function Node() {

        /**
         * Adds the node newChild to the end of the list of children of this node. If the newChild is already in the tree, it is first removed.
         * @governance none
         * @param {Object} options
         * @param {Node} options.newChild the node to add
         * @return {Node} the node added
         * @throws {SuiteScriptError} SSS_DOM_EXCEPTION if node cannot be appended for some reason
         *
         * @since 2015.2
         */
        this.appendChild = function (options) { };

        /**
         * Returns a duplicate of this node, i.e., serves as a generic copy constructor for nodes. The duplicate node has no parent.
         * @governance none
         * @param {Object} options
         * @param {boolean} options.deep if true, recursively clone the subtree under the specified node; if false, clone only the node itself (and its attributes, if it is an Element)
         * @return {Node} the duplicate node
         *
         * @since 2015.2
         */
        this.cloneNode = function (options) { };

        /**
         * Compares the reference node, i.e. the node on which this method is being called, with a node, i.e. the one passed as a parameter,
         * with regard to their position in the document and according to the document order.
         * @governance none
         * @param {Object} options
         * @param {Node} options.other the node to compare against the reference node
         * @return {number} how the node is positioned relatively to the reference node
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION when the nodes cannot be compared
         */
        this.compareDocumentPosition = function (options) { };

        /**
         * Returns whether this node (if it is an Element) has any attributes.
         * @governance none
         * @return {boolean} true if this node has any attributes, false otherwise
         *
         * @since 2015.2
         */
        this.hasAttributes = function () { };

        /**
         * Returns whether this node has any children.
         * @governance none
         * @return {boolean} true if this node has any children, false otherwise
         *
         * @since 2015.2
         */
        this.hasChildNodes = function () { };

        /**
         * Inserts the node newChild before the existing child node refChild. If refChild is null, insert newChild at the end of the list of children.
         * If the newChild is already in the tree, it is first removed.
         * @governance none
         * @param {Object} options
         * @param {Node} options.newChild the node to insert
         * @param {Node} options.refChild the reference node, i.e., the node before which the new node will be inserted
         * @return {Node} the node being inserted
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if node cannot be inserted for some reason
         *
         * @since 2015.2
         */
        this.insertBefore = function (options) { };

        /**
         * This method checks if the specified namespaceURI is the default namespace or not.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI to look for
         * @return {boolean} true if the specified namespaceURI is the default namespace, false otherwise
         *
         * @since 2015.2
         */
        this.isDefaultNamespace = function (options) { };

        /**
         * Tests whether two nodes are equal.
         * This method tests for equality of nodes, not sameness (i.e., whether the two nodes are references to the same object) which can be tested
         * with Node.isSameNode(). All nodes that are the same will also be equal, though the reverse may not be true.
         * Two nodes are equal if and only if the following conditions are satisfied:
         * - The two nodes are of the same type.
         * - The following string attributes are equal: nodeName, localName, namespaceURI, prefix, nodeValue
         * - The attributes maps are equal
         * - The childNodes lists are equal
         * @governance none
         * @param {Object} options
         * @param {Node} options.other the node to compare equality with
         * @return {boolean} true if the nodes are equal, false otherwise
         *
         * @since 2015.2
         */
        this.isEqualNode = function (options) { };

        /**
         * Returns whether this node is the same node as the given one.
         * This method provides a way to determine whether two Node references returned by the implementation reference the same object.
         * When two Node references are references to the same object, even if through a proxy, the references may be used completely interchangeably,
         * such that all attributes have the same values and calling the same DOM method on either reference always has exactly the same effect.
         * @governance none
         * @param {Object} options
         * @param {Node} options.other the node to test against
         * @return {boolean} true if the nodes are the same, false otherwise
         *
         * @since 2015.2
         */
        this.isSameNode = function (options) { };

        /**
         * Look up the namespace URI associated to the given prefix, starting from this node.
         * @governance none
         * @param {Object} options
         * @param {string} options.prefix the prefix to look for; if this parameter is null, the method will return the default namespace URI if any
         * @return {string} the associated namespace URI or null if none is found
         *
         * @since 2015.2
         */
        this.lookupNamespaceURI = function (options) { };

        /**
         * Look up the prefix associated to the given namespace URI, starting from this node. The default namespace declarations are ignored by this method.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI to look for
         * @return {string} an associated namespace prefix if found or null if none is found; if more than one prefix are associated to the namespace prefix, the returned namespace prefix is implementation dependent
         *
         * @since 2015.2
         */
        this.lookupPrefix = function (options) { };

        /**
         * Puts all Text nodes in the full depth of the sub-tree underneath this Node, including attribute nodes, into a "normal" form
         * where only structure (e.g., elements, comments, processing instructions, CDATA sections, and entity references) separates
         * Text nodes, i.e., there are neither adjacent Text nodes nor empty Text nodes.
         * @governance none
         * @return {void}
         *
         * @since 2015.2
         */
        this.normalize = function () { };

        /**
         * Removes the child node indicated by oldChild from the list of children, and returns it.
         * @governance none
         * @param {Object} options
         * @param {Node} options.oldChild the node being removed
         * @return {Node} the node removed
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if node cannot be removed for some reason
         *
         * @since 2015.2
         */
        this.removeChild = function (options) { };

        /**
         * Replaces the child node oldChild with newChild in the list of children, and returns the oldChild node.
         * If the newChild is already in the tree, it is first removed.
         * @governance none
         * @param {Object} options
         * @param {Node} options.newChild the new node to put in the child list
         * @param {Node} options.oldChild the node being replaced in the list
         * @return {Node} the node replaced
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if node cannot be replaced for some reason
         *
         * @since 2015.2
         */
        this.replaceChild = function (options) { };

        /**
         * A map of key/value (string->Attr) pairs containing the attributes of this node (if it is an Element) or null otherwise.
         * @name Node#attributes
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.attributes = undefined;
        /**
         * The absolute base URI of this node or null if the implementation wasn't able to obtain an absolute URI.
         * @name Node#baseURI
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.baseURI = undefined;
        /**
         * An array of all children of this node. If there are no children, this is an empty array.
         * @name Node#childNodes
         * @type {Array<Node>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.childNodes = undefined;
        /**
         * The first child of this node or null if there is no such node.
         * @name Node#firstChild
         * @type {Node}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.firstChild = undefined;
        /**
         * The last child of this node or null if there is no such node.
         * @name Node#lastChild
         * @type {Node}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.lastChild = undefined;
        /**
         * The local part of the qualified name of this node.
         * @name Node#localName
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.localName = undefined;
        /**
         * The namespace URI of this node, or null if it is unspecified.
         * @name Node#namespaceURI
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.namespaceURI = undefined;
        /**
         * The node immediately following this node or null if there is no such node.
         * @name Node#nextSibling
         * @type {Node}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.nextSibling = undefined;
        /**
         * The name of this node, depending on its type.
         * @name Node#nodeName
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.nodeName = undefined;
        /**
         * The type of the underlying object.
         * @name Node#nodeType
         * @type {NodeType}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.nodeType = undefined;
        /**
         * The value of this node, depending on its type. When it is defined to be null, setting it has no effect, including if the node is read-only.
         * @name Node#nodeValue
         * @type {string}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if it's not possible to get or set the property value
         *
         * @since 2015.2
         */
        this.nodeValue = undefined;
        /**
         * The Document object associated with this node. This is also the Document object used to create new nodes.
         * @name Node#ownerDocument
         * @type {Document}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.ownerDocument = undefined;
        /**
         * The parent of this node. All nodes, except Attr, Document, DocumentFragment, Entity, and Notation may have a parent.
         * @name Node#parentNode
         * @type {Node}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.parentNode = undefined;
        /**
         * The namespace prefix of this node, or null if it is unspecified. When it is defined to be null, setting it has no effect, including if the node is read-only.
         * @name Node#prefix
         * @type {string}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if it's not possible to set the property value
         *
         * @since 2015.2
         */
        this.prefix = undefined;
        /**
         * The node immediately preceding this node or null if there is no such node.
         * @name Node#previousSibling
         * @type {Node}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.previousSibling = undefined;
        /**
         * This attribute returns the text content of this node and its descendants. When it is defined to be null, setting it has no effect.
         * @name Node#textContent
         * @type {string}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if it's not possible to get or set the property value
         *
         * @since 2015.2
         */
        this.textContent = undefined;
        /**
         * Returns the object type name (xml.Node)
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

    return new Node();
});