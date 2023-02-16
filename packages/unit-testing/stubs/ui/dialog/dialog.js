define([], function () {
    /**
     * SuiteScript Dialog Module (Client Side)
     * Modules within the N/ui namespace allow you to build a custom UI using SuiteScript 2.0. Note that N/ui itself is not a module.
     *
     * @module N/ui/dialog
     * @suiteScriptVersion 2.x
     *
     */
    var dialog = function () { };

    /**
     * Creates an Alert Dialog with an OK Button.
     * @restriction Client SuiteScript only
     * @governance none
     * @param {Object} options The options object.
     * @param {string} [options.title] The alert dialog title. This value defaults to an empty string.
     * @param {string} [options.message] The content of the alert dialog. This value defaults to an empty string.
     *
     * @return {Promise} A Promise object. Pass a function into the then portion to fire a callback when the button is pressed.
     *                   The callback will be passed in a response object which contains the value of the button where:
     *                   OK returns true.
     *
     * @since 2016.1
     */
    dialog.prototype.alert = function (options) { };

    /**
     * Creates an Confirm Dialog with OK and Cancel Button.
     * @restriction Client SuiteScript only
     * @governance none
     * @param {Object} options The options object.
     * @param {string} [options.title] The confirmation dialog title. This value defaults to an empty string.
     * @param {string} [options.message] The content of the confirmation dialog. This value defaults to an empty string.
     *
     * @return {Promise} A Promise object. Pass a function into the then portion to fire a callback when the button is pressed.
     *					 The callback will be passed in a response object which contains the value of the button where:
     *					 OK returns true and Cancel returns false.
     *
     * @since 2016.1
     */
    dialog.prototype.confirm = function (options) { };

    /**
     * Creates an Dialog with the specified buttons.
     * @restriction Client SuiteScript only
     * @governance none
     * @param {Object} options The options object.
     * @param {string} [options.title] The dialog title. This value defaults to an empty string.
     * @param {string} [options.message] The content of the dialog. This value defaults to an empty string.
     * @param {Array<ButtonOption>} [options.buttons] A list of buttons to include in the dialog. Each item in the button list must be a Javascript Object that contains a label and a value property.
     * @return {Promise} A Promise object. Pass a function into the then portion to fire a callback when the button is pressed.
     *					 The callback will be passed in a response object which contains the value of the button.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options.buttons is specified and is not an array.
     * @throws {SuiteScriptError} BUTTONS_MUST_INCLUDE_BOTH_A_LABEL_AND_VALUE If options.buttons is specified and one or more items do not have a label and/or value.
     *
     * @since 2016.1
     *
     */
    dialog.prototype.create = function (options) { };

    /**
     * @exports N/ui/dialog
     * @namespace dialog
     */
    return new dialog();
});