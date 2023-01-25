define([], function () {
    /**
     *
     * @protected
     * @class SuiteScriptError
     * @classdesc Base class of SuiteScript errors
     * @constructor
     *
     * @since 2015.2
     */
    function SuiteScriptError() {

        /**
         * @name SuiteScriptError#type
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.type = undefined;
        /**
         * Error ID that is automatically generated when a new error is created
         * @name SuiteScriptError#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * User-defined error code
         * @name SuiteScriptError#name
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * Error message text displayed in the Details column of the Execution Log.
         * @name SuiteScriptError#message
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.message = undefined;
        /**
         * List of method calls that the script is executing when the error is thrown. The most recently executed method is
         * listed at the top or the list.
         * @name SuiteScriptError#stack
         * @type {Array<string>}
         * @readonly
         *
         * @since 2015.2
         */
        this.stack = undefined;
        /**
         * Cause of the SuiteScript error. It either returns the error itself, or another error, which caused this new
         * error to happen.
         * @name SuiteScriptError#cause
         * @type {SuiteScriptError}
         * @readonly
         *
         * @since 2016.1
         */
        this.cause = undefined;
        /**
         * Error email supression indicator
         * @name SuiteScriptError#notifyOff
         * @type {boolean}
         * @readonly
         *
         * @since 2016.2
         */
        this.notifyOff = undefined;
        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns stringified representation of this SuiteScriptError
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new SuiteScriptError();
});