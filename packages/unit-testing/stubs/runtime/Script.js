define([], function () {
    /**
     * @class Script
     * @classdesc Class for retrieving information about currently running script
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Script() {

        /**
         * The script logging level for the currently executing script. Returns one of the following values: DEBUG, AUDIT, ERROR, EMERGENCY.
         * @name Script#logLevel
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.logLevel = undefined;
        /**
         * The script ID for the currently executing script.
         * @name Script#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The current script's runtime version
         * @name Script#apiVersion
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.apiVersion = undefined;
        /**
         * The deployment ID for the script deployment on the currently executing script.
         * @name Script#deploymentId
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.deploymentId = undefined;
        /**
         * An array of bundle IDs for the bundles that include the currently executing script.
         * @name Script#bundleIds
         * @type {Array<string>}
         * @readonly
         *
         * @since 2015.2
         */
        this.bundleIds = undefined;
        /**
         * Returns the number of usage units remaining for the currently executing script.
         * @governance none
         * @return {number}
         *
         * @since 2015.2
         */
        this.getRemainingUsage = function () { };

        /**
         * Returns the value of a script parameter for the currently executing script.
         * @governance none
         * @param {Object} options
         * @param {string} options.name The name of the parameter
         * @return {number|Date|string|boolean|null|undefined}
         *
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         * @throws {SuiteScriptError} WRONG_PARAMETER_NAME when name is not string
         *
         * @since 2015.2
         */
        this.getParameter = function (options) { };

        /**
         * The percent complete specified for the current scheduled script execution. This value appears in the % Complete  column on the Scheduled Script Status page. This value can be set or retrieved.
         * @name Script#percentComplete
         * @type {number}
         * @throws {SuiteScriptError} SSS_OPERATION_UNAVAILABLE Thrown if the currently executing script is not a scheduled script.
         *
         * @since 2015.2
         */
        this.percentComplete = undefined;
        /**
         * JSON.stringify() implementation.
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new Script();
});