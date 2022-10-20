define([], function () {
    /**
     * Return a new instance of XML Element.
     * @class Element
     * @classDescription Encapsulation of W3C DOM Element
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Element() {

        /**
         * Retrieves an attribute value by name.
         * @governance none
         * @param {Object} options
         * @param {string} options.name the name of the attribute to retrieve
         * @return {string} the Attr value as a string, or the empty string if that attribute does not have a specified or default value
         *
         * @since 2015.2
         */
        this.getAttribute = function (options) { };

        /**
         * Retrieves an attribute node by name.
         * @governance none
         * @param {Object} options
         * @param {string} options.name the name of the attribute to retrieve
         * @return {Attr} the Attr node with the specified name or null if there is no such attribute
         *
         * @since 2015.2
         */
        this.getAttributeNode = function (options) { };

        /**
         * Retrieves an attribute node by local name and namespace URI.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the attribute to retrieve; can be null
         * @param {string} options.localName the local name of the attribute to retrieve
         * @return {Attr} the Attr node with the specified attribute local name and namespace URI or null if there is no such attribute
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be retrieved for some reason
         *
         * @since 2015.2
         */
        this.getAttributeNodeNS = function (options) { };

        /**
         * Retrieves an attribute value by local name and namespace URI.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the attribute to retrieve; can be null
         * @param {string} options.localName the local name of the attribute to retrieve
         * @return {string} the Attr value as a string, or the empty string if that attribute does not have a specified or default value
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be retrieved for some reason
         *
         * @since 2015.2
         */
        this.getAttributeNS = function (options) { };

        /**
         * Returns an array of all descendant Elements with a given tag name, in document order.
         * @governance none
         * @param {Object} options
         * @param {string} options.tagName the name of the tag to match on; the special value "*" matches all tags; for XML, the tagName parameter is case-sensitive
         * @return {Array<Element>} an array of matching Element nodes
         *
         * @since 2015.2
         */
        this.getElementsByTagName = function (options) { };

        /**
         * Returns an array of all descendant Elements with a given local name and namespace URI in document order.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the elements to match on; the special value "*" matches all namespaces
         * @param {string} options.localName the local name of the elements to match on; the special value "*" matches all local names
         * @return {Array<Element>} an array of matching Element nodes
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the elements cannot be retrieved for some reason
         *
         * @since 2015.2
         */
        this.getElementsByTagNameNS = function (options) { };

        /**
         * Returns true when an attribute with a given name is specified on this element or has a default value, false otherwise.
         * @governance none
         * @param {Object} options
         * @param {string} options.name the name of the attribute to look for
         * @return {boolean} true if an attribute with the given name is specified on this element or has a default value, false otherwise
         *
         * @since 2015.2
         */
        this.hasAttribute = function (options) { };

        /**
         * Returns true when an attribute with a given local name and namespace URI is specified on this element or has a default value, false otherwise.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the attribute to look for; can be null
         * @param {string} options.localName the local name of the attribute to look for
         * @return {boolean} true if an attribute with the given local name and namespace URI is specified or has a default value on this element, false otherwise
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the command cannot be performed for some reason
         *
         * @since 2015.2
         */
        this.hasAttributeNS = function (options) { };

        /**
         * Removes an attribute by name.
         * @governance none
         * @param {Object} options
         * @param {string} options.name the name of the attribute to remove
         * @return {void}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be removed for some reason
         *
         * @since 2015.2
         */
        this.removeAttribute = function (options) { };

        /**
         * Removes the specified attribute node.
         * @governance none
         * @param {Object} options
         * @param {Attr} options.oldAttr the Attr node to remove from the attribute list
         * @return {Attr} the Attr node that was removed
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be added for some reason
         *
         * @since 2015.2
         */
        this.removeAttributeNode = function (options) { };

        /**
         * Removes an attribute by local name and namespace URI.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the attribute to remove; can be null
         * @param {string} options.localName the local name of the attribute to remove
         * @return {void}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be removed for some reason
         *
         * @since 2015.2
         */
        this.removeAttributeNS = function (options) { };

        /**
         * Adds a new attribute. If an attribute with that name is already present in the element, its value is changed to be that of the value parameter.
         * @governance none
         * @param {Object} options
         * @param {string} options.name the name of the attribute to create or alter
         * @param {string} options.value value to set in string form
         * @return {void}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be added for some reason
         *
         * @since 2015.2
         */
        this.setAttribute = function (options) { };

        /**
         * Adds a new attribute node. If an attribute with that name is already present in the element, it is replaced by the new one.
         * @governance none
         * @param {Object} options
         * @param {Attr} options.newAttr the Attr node to add to the attribute list
         * @return {Attr} if the newAttr attribute replaces an existing attribute, the replaced Attr node is returned, otherwise null is returned
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be added for some reason
         *
         * @since 2015.2
         */
        this.setAttributeNode = function (options) { };

        /**
         * Adds a new attribute node. If an attribute with that local name and that namespace URI is already present in the element, it is replaced by the new one.
         * @governance none
         * @param {Object} options
         * @param {Attr} options.newAttr the Attr node to add to the attribute list
         * @return {Attr} if the newAttr attribute replaces an existing attribute with the same local name and namespace URI, the replaced Attr node is returned, otherwise null is returned
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be added for some reason
         *
         * @since 2015.2
         */
        this.setAttributeNodeNS = function (options) { };

        /**
         * Adds a new attribute. If an attribute with the same local name and namespace URI is already present on the element, its prefix is changed
         * to be the prefix part of the qualifiedName, and its value is changed to be the value parameter.
         * @governance none
         * @param {Object} options
         * @param {string} options.namespaceURI the namespace URI of the attribute to create or alter; can be null
         * @param {string} options.qualifiedName the qualified name of the attribute to create or alter
         * @param {string} options.value value to set in string form
         * @return {void}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the attribute cannot be added for some reason
         *
         * @since 2015.2
         */
        this.setAttributeNS = function (options) { };

        /**
         * The name of the element.
         * @name Element#tagName
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.tagName = undefined;
        /**
         * Returns the object type name (xml.Element)
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

    return new Element();
});