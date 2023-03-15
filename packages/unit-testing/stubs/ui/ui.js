define(['./dialog/dialog', './message/message', './serverWidget/serverWidget'], function (dialog, message, serverWidget) {
    /**
     * SuiteScript UI Module (Client Side)
     *
     * @module N/ui
     * @suiteScriptVersion 2.x
     *
     */
    var ui = function() {};

    ui.prototype.dialog = dialog;
    ui.prototype.message = message;
    ui.prototype.serverWidget = serverWidget;

    /**
     * @exports N/ui
     * @namespace ui
     */
    return new ui();
});