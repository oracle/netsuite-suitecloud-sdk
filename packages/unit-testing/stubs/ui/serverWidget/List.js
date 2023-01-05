define(['./ListColumn', './Button'], function (ListColumn, Button) {
    /**
     * @class List
     * @classdesc Primary object used to encapsulate a list page
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function List() {

        /**
         * Sets the display style for this list
         * Possible values are in serverWidget.ListStyle.
         * @name List#style
         * @type {string}
         *
         * @since 2015.2
         */
        this.style = undefined;
        /**
         * List title
         * @name List#title
         * @type {string}
         *
         * @since 2015.2
         */
        this.title = undefined;
        /**
         * Add a Button to the list page
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id for button. The id must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the button to an existing page.
         * @param {string} options.label the ui label of button
         * @param {string} [options.functionName] The function name to call when clicking on this button.
         * @return {Button}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addButton = function (options) { };

        /**
         * Adds a column to a list page
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id   The internal id for the column
         * @param {string} options.type  The type for the column
         * @param {string} options.label  The ui label for the column
         * @param {string} [options.align] The layout justification for this column. Set this value using the serverWidget.LayoutJustification enum. The default value is left.
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label, or type parameter is missing
         *
         * @since 2015.2
         */
        this.addColumn = function (options) { };

        /**
         * Adds a column containing Edit or Edit/View links to the list page.
         * The column is added to the left of a previously existing column.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {ListColumn} options.column  The Edit/View column is added to the left of this column
         * @param {boolean} [options.showView]  If true then an Edit/View column will be added. Otherwise only an Edit column will be added.
         * @param {string} [options.showHrefCol] - If set, this value must be included in row data provided for the
         * list and will be used to determine whether the URL for this link is clickable
         * @param {string} [options.link] The target of Edit/View link (For example: /app/common/entity/employee.nl). The complete link is formed like this: /app/common/entity/employee.nl?id=123
         * @param {string} [options.linkParam] If set, this value must be included in row data provided for the
         * list and will be appended to link as url parameter (defaults to column). The internal ID of the field in the row data where to take the parameter from.
         * @param {string} [options.linkParamName] Name of the url link parameter (defaults to 'id' if not set)
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when any required parameter is missing
         *
         * @since 2015.2
         */
        this.addEditColumn = function (options) { };

        /**
         * Adds a navigation cross-link to the list page
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.type  The type of link to add. The value is set using the FormPageLinkType enum.
         * @param {string} options.title  The UI text displayed in the link
         * @param {string} options.url  The URL used for this link
         * @return {List}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when type, title or url parameter is missing
         *
         * @since 2015.2
         */
        this.addPageLink = function (options) { };

        /**
         * Adds a single row to a list (Array of name/value pairs or search.Result)
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {Object} options.row  Row definition corresponds to a search.Result object or contains name/value pairs containing the values for the corresponding Column object in the list.
         * @return {List}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when row parameter is missing
         *
         * @since 2015.2
         */
        this.addRow = function (options) { };

        /**
         * Adds multiple rows (Array of search.Result or name/value pair Arrays)
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Array<Object>} options.rows An array of rows that consist of either a search.Result array, or an array of name/value pairs. Each pair should contain the value for the corresponding Column object in the list.
         * @return {List}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when rows parameter is missing
         *
         * @since 2015.2
         */
        this.addRows = function (options) { };

        /**
         * The file cabinet ID of client script file to be used in this list.
         * @name List#clientScriptFileId
         * @type {number}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptModulePath property was set beforehand
         *
         * @since 2015.2
         */
        this.clientScriptFileId = undefined;
        /**
         * The file path of client script file to be used in this list.
         * @name List#clientScriptModulePath
         * @type {string}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptFileId property was set beforehand
         *
         * @since 2015.2
         */
        this.clientScriptModulePath = undefined;
        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new List();
});