define(['./Element'], function (Element) {
    /**
     * Return a new instance of XML Attr.
     * @class Attr
     * @classDescription Encapsulation of W3C DOM Attr
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
     function Attr() {

        /**
         * Returns the name of this attribute. If Node.localName is different from null, this property is a qualified name.
         * @name Attr#name
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * The Element node this attribute is attached to or null if this attribute is not in use.
         * @name Attr#ownerElement
         * @type {Element}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.ownerElement = undefined;
        /**
         * True if this attribute was explicitly given a value in the instance document, false otherwise.
         * @name Attr#specified
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.specified = undefined;
        /**
         * The attribute value. On retrieval, the value of the attribute is returned as a string. Character and general entity
         * references are replaced with their values. On setting, this creates a Text node with the unparsed contents of the string,
         * i.e. any characters that an XML processor would recognize as markup are instead treated as literal text.
         * @name Attr#value
         * @type {string}
         * @throws {SuiteScriptError} SSS_XML_DOM_EXCEPTION if the value cannot be set for some reason
         *
         * @since 2015.2
         */
        this.value = undefined;
        /**
         * Returns the object type name (xml.Attr)
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

    return new Attr();
});