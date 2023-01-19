define([], function () {
    /**
     * SuiteScript portlet module
     *
     * @module N/portlet
     * @NApiVersion 2.x
     *
     */
    var portlet = function () { };

    /**
     * Causes a FORM type portlet to immediately refresh.
     * @restriction Client SuiteScript only
     * @governance none
     * @throws {SuiteScriptError} SSS_INVALID_UI_OBJECT_TYPE if portlet is not FORM type
     *
     * @since 2016.1
     */
    portlet.prototype.refresh = function () { };

    /**
     * Causes a FORM type portlet to be immediately resized.
     * @restriction Client SuiteScript only
     * @governance none
     * @throws {SuiteScriptError} SSS_INVALID_UI_OBJECT_TYPE if portlet is not FORM type
     *
     * @since 2016.1
     */
    portlet.prototype.resize = function () { };

    /**
     * @exports N/portlet
     * @namespace portlet
     */
    return new portlet();
});