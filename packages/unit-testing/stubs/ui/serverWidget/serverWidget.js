define(['./Assistant', './Form', './List'], function (Assistant, Form, List) {
    /**
     * SuiteScript module
     *
     * @module N/ui/serverWidget
     * @suiteScriptVersion 2.x
     *
     */
    var serverWidget = function () { };

    /**
     * Instantiate an assistant object (specifying the title, and whether to hide the menu)
     * @restriction Server SuiteScript only
     * @param {Object} options
     * @param {string} options.title The title of the assistant. This title appears at the top of all assistant pages.
     * @param {boolean} [options.hideNavBar] Indicates whether to hide the navigation bar menu. By default, set to false. The header appears in the top-right corner on the assistant. If set to true, the header on the assistant is hidden from view.
     * @return {Assistant}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title parameter is missing
     * @since 2015.2
     */
    serverWidget.prototype.createAssistant = function (options) { };

    /**
     * Instantiate a form object (specifying the title, and whether to hide the menu)
     * @restriction Server SuiteScript only
     * @param {Object} options
     * @param {string} options.title The title of the form.
     * @param {boolean} [options.hideNavBar] Indicates whether to hide the navigation bar menu. By default, set to false. The header appears in the top-right corner on the form. If set to true, the header on the form is hidden from view.
     * @return {Form}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title parameter is missing
     * @since 2015.2
     */
    serverWidget.prototype.createForm = function (options) { };

    /**
     * Instantiate a List object (specifying the title, and whether to hide the navigation bar)
     * @restriction Server SuiteScript only
     * @param {Object} options
     * @param {string} options.title The title of the list.
     * @param {boolean} [options.hideNavBar] Indicates whether to hide the navigation bar menu. By default, set to false. The header appears in the top-right corner on the list. If set to true, the header on the list is hidden from view.
     * @return {List}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title parameter is missing
     * @since 2015.2
     */
    serverWidget.prototype.createList = function (options) { };

    /**
     * Enumeration that holds the values for supported field types. This enum is used to set the value of the type parameter when Form.addField(options) is called.
     *
     * Consider the following as you work with these field types:
     * The FILE field type is available only for Suitelets and will appear on the main tab of the Suitelet page. FILE fields cannot be added to tabs, subtabs, sublists, or field groups and are not allowed on existing pages.
     * The INLINEHTML and RICHTEXT field types are not supported with Sublist.addField(options).
     * The IMAGE field type is available only for fields that appear on list/staticlist sublists. You cannot specify an IMAGE field on a form.
     * The MULTISELECT field type is not supported by SuiteScript 2.0 Suitelets.
     * Radio buttons that are inside one container are exclusive. The method addField on form has an optional parameter container. For an example, see FieldGroup.label.
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldType() {
        this.CHECKBOX = 'CHECKBOX';
        this.CURRENCY = 'CURRENCY';
        this.DATE = 'DATE';
        this.DATETIME = 'DATETIME';
        this.DATETIMETZ = 'DATETIMETZ';
        this.EMAIL = 'EMAIL';
        this.FILE = 'FILE';
        this.FLOAT = 'FLOAT';
        this.HELP = 'HELP';
        this.IMAGE = 'IMAGE';
        this.INLINEHTML = 'INLINEHTML';
        this.INTEGER = 'INTEGER';
        this.LABEL = 'LABEL';
        this.LONGTEXT = 'LONGTEXT';
        this.MULTISELECT = 'MULTISELECT';
        this.PASSWORD = 'PASSWORD';
        this.PERCENT = 'PERCENT';
        this.PHONE = 'PHONE';
        this.RADIO = 'RADIO';
        this.RICHTEXT = 'RICHTEXT';
        this.SELECT = 'SELECT';
        this.TEXTAREA = 'TEXTAREA';
        this.TEXT = 'TEXT';
        this.TIMEOFDAY = 'TIMEOFDAY';
        this.URL = 'URL';
    }

    serverWidget.prototype.FieldType = new serverWidgetFieldType();

    /**
     * Enumeration that holds the string values for supported page link types on a form. This enum is used to set the value of the type parameter when Form.addPageLink(options) is called.
     * BREADCRUMB - Link appears on the top-left corner after the system bread crumbs
     * CROSSLINK - Link appears on the top-right corner.
     * @enum {string}
     * @readonly
     *
     */
    function serverWidgetFormPageLinkType() {
        this.BREADCRUMB = 'BREADCRUMB';
        this.CROSSLINK = 'CROSSLINK';
    }

    serverWidget.prototype.FormPageLinkType = new serverWidgetFormPageLinkType();

    /**
     * Enumeration that holds the string values for valid sublist types. This enum is used to define the type parameter when Form.addSublist(options) is called.
     * INLINEEDITOR and EDITOR:
     * These types of sublists are both fully editable. The only difference between these types is their appearance in the UI:
     *
     * With an inline editor sublist, a new line is displayed at the bottom of the list after existing lines. To add a line, a user working in the UI clicks inside the new line and adds a value to each column as appropriate. Examples of this style include the Item sublist on the sales order record and the Expense sublist on the expense report record.
     * With an editor sublist, a user in the UI adds a new line by working with fields that are displayed above the existing sublist lines. This style is not common on standard NetSuite record types.
     *
     * LIST: This type of sublist has a fixed number of lines. You can update an existing line, but you cannot add lines to it.
     *
     * To make a field within a LIST type sublist editable, use Field.updateDisplayType(options) and the enum serverWidget.FieldDisplayType to update the field display type to ENTRY.
     * STATICLIST: This type of sublist is read-only. It cannot be edited in the UI, and it is not available for scripting.
     * @enum {string}
     * @readonly
     */
    function serverWidgetSublistType() {
        this.EDITOR = 'EDITOR';
        this.INLINEEDITOR = 'INLINEEDITOR';
        this.LIST = 'LIST';
        this.STATICLIST = 'STATICLIST';
    }

    serverWidget.prototype.SublistType = new serverWidgetSublistType();

    /**
     * Enumeration that holds the string values for supported field break types. This enum is used to set the value of the breakType parameter when Field.updateBreakType(options) is called.
     * NONE: This is the default value for field break type.
     * STARTCOL: This value moves the field into a new column. Additionally, it disables automatic field balancing if set on any field.
     * STARTROW: This value places a field located outside of a field group on a new row. This value only works on fields with a Field Layout Type set to OUTSIDE, OUTSIDEABOVE or OUTSIDEBELOW. For more information, see serverWidget.FieldLayoutType and Field.updateLayoutType(options).
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldBreakType() {
        this.NONE = 'NONE';
        this.STARTCOL = 'STARTCOL';
        this.STARTROW = 'STARTROW';
    }

    serverWidget.prototype.FieldBreakType = new serverWidgetFieldBreakType();

    /**
     * Enumeration that holds the string values for the supported types of field layouts. This enum is used to set the value of the layoutType parameter when Field.updateLayoutType(options) is called.
     * STARTROW: This value makes the field appear first in a horizontally aligned field group in the normal field layout.
     * MIDROW: This value makes the field appear in the middle of a horizontally aligned field group in the normal field layout.
     * ENDROW: This value makes the field appear last in a horizontally aligned field group in the normal field layout.
     * OUTSIDE:	This value makes the field appear outside (above or below based on form default) the normal field layout area.
     * OUTSIDEBELOW: This value makes the field appear below the normal field layout area. Using this allows you to position a field below a field group.
     * OUTSIDEABOVE: This value makes the field appear above the normal field layout area. Using this allows you to position a field above a field group.
     * NORMAL: This value makes the fields appear in its default position.
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldLayoutType() {
        this.NORMAL = 'NORMAL';
        this.OUTSIDE = 'OUTSIDE';
        this.OUTSIDEBELOW = 'OUTSIDEBELOW';
        this.OUTSIDEABOVE = 'OUTSIDEABOVE';
        this.STARTROW = 'STARTROW';
        this.MIDROW = 'MIDROW';
        this.ENDROW = 'ENDROW';
    }

    serverWidget.prototype.FieldLayoutType = new serverWidgetFieldLayoutType();

    /**
     * Enumeration that holds the string values for supported field display types. This enum is used to set the value of the displayType parameter when Field.updateDisplayType(options) is called.
     * DISABLED: Prevents a user from changing the field
     * ENTRY: The sublist field appears as a data entry input field (for a select field without a checkbox)
     * HIDDEN: The field on the form is hidden.
     * INLINE: The field appears as inline text
     * NORMAL: The field appears as a normal input field (for non-sublist fields)
     * READONLY: The field is disabled but it is still selectable and scrollable (for textarea fields)
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldDisplayType() {
        this.NORMAL = 'NORMAL';
        this.HIDDEN = 'HIDDEN';
        this.READONLY = 'READONLY';
        this.DISABLED = 'DISABLED';
        this.ENTRY = 'ENTRY';
        this.INLINE = 'INLINE';
        this.NODISPLAY = 'NODISPLAY';
    }

    serverWidget.prototype.FieldDisplayType = new serverWidgetFieldDisplayType();

    /**
     * Enumeration that holds the string values for supported sublist display types. This enum is used to set the value of the Sublist.displayType property.
     * @enum {string}
     * @readonly
     */
    function serverWidgetSublistDisplayType() {
        this.NORMAL = 'NORMAL';
        this.HIDDEN = 'HIDDEN';
    }

    serverWidget.prototype.SublistDisplayType = new serverWidgetSublistDisplayType();

    /**
     * Enumeration that holds the string values for supported justification layouts. This enum is used to set the value of the align parameter when List.addColumn(options) is called.
     * @enum {string}
     * @readonly
     */
    function serverWidgetLayoutJustification() {
        this.CENTER = 'CENTER';
        this.LEFT = 'LEFT';
        this.RIGHT = 'RIGHT';
    }

    serverWidget.prototype.LayoutJustification = new serverWidgetLayoutJustification();

    /**
     * Enumeration that holds the string values for supported list styles. This enum is used to set the value of the List.style property.
     * @enum {string}
     * @readonly
     */
    function serverWidgetListStyle() {
        this.GRID = 'grid';
        this.REPORT = 'report';
        this.PLAIN = 'plain';
        this.NORMAL = 'normal';
    }

    serverWidget.prototype.ListStyle = new serverWidgetListStyle();

    /**
     * Holds the string values for submit actions performed by the user. This enum is used to set the value of the Assistant.getLastAction().
     * After a finish action is submitted, by default, the text “Congratulations! You have completed the <assistant title>” appears on the finish page.
     * In a non-sequential process (steps are unordered), jump is used to move to the user’s last action.
     * @enum {string}
     * @readonly
     */
    function serverWidgetAssistantSubmitAction() {
        this.NEXT = 'next';
        this.BACK = 'back';
        this.CANCEL = 'cancel';
        this.FINISH = 'finish';
        this.JUMP = 'jump';
    }

    serverWidget.prototype.AssistantSubmitAction = new serverWidgetAssistantSubmitAction();

    /**
     * @exports N/ui/serverWidget
     * @namespace serverWidget
     */
    return new serverWidget();
});