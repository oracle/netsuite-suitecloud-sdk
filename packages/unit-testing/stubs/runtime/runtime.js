define(['./Script', './Session', './User'], function (Script, Session, User) {
    /**
     * SuiteScript module
     *
     * @module N/runtime
     * @suiteScriptVersion 2.x
     *
     */
    var runtime = function () { };

    /**
     * Returns a runtime.User object that represents the properties and preferences for the user currently executing the script.
     * Use this method to get session objects for the current user session. If you want to get properties for the script or session, use runtime.getCurrentScript() or runtime.getCurrentSession() instead.
     * @governance none
     * @return {User}
     *
     * @since 2015.2
     */
    runtime.prototype.getCurrentUser = function () { };

    /**
     * Returns a runtime.Script object that represents the currently executing script.
     * Use this method to get properties and parameters of the currently executing script and script deployment. If you want to get properties for the session or user, use runtime.getCurrentSession() or runtime.getCurrentUser() instead.
     * @governance none
     * @return {Script}
     *
     * @since 2015.2
     */
    runtime.prototype.getCurrentScript = function () { };

    /**
     * Returns a runtime.Session object that represents the user session for the currently executing script.
     * Use this method to get session objects for the current user session. If you want to get properties for the script or user, use runtime.getCurrentScript() or runtime.getCurrentUser() instead.
     * @governance none
     * @return {Session}
     *
     * @since 2015.2
     */
    runtime.prototype.getCurrentSession = function () { };

    /**
     * Use this method to determine if a particular feature is enabled in a NetSuite account.
     * @governance none
     * @param {Object} options
     * @param {string} options.feature id of the feature
     * @return {boolean}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when feature argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when feature is not string
     *
     * @since 2015.2
     */
    runtime.prototype.isFeatureInEffect = function (options) { };

    /**
     * The number of scheduled script queues available in the current account.
     * @name Runtime#queueCount
     * @type {number}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.prototype.queueCount = undefined;
    /**
     * The number of processors available to the current account.
     * @name Runtime#processorCount
     * @type {number}
     * @readonly
     *
     * @since 2018.1
     */
    runtime.prototype.processorCount = undefined;
    /**
     * The version of NetSuite the current account is runnning.
     *
     * @name Runtime#version
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.prototype.version = undefined;
    /**
     * The account ID for the current user.
     * @name Runtime#accountId
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.prototype.accountId = undefined;
    /**
     * The country for the current company
     * @name Runtime#country
     * @type {string}
     * @readonly
     *
     * @since 2020.2
     */
    runtime.prototype.country = undefined;
    /**
     * The current environment in which the script is executing. This property uses values from the runtime.EnvType enum.
     * @name Runtime#envType
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.prototype.envType = undefined;
    /**
     * The trigger of the current script. This property uses values from the runtime.ContextType enum.
     * @name Runtime#executionContext
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.prototype.executionContext = undefined;
    /**
     * JSON.stringify() implementation.
     * @governance none
     * @return {Object}
     *
     * @since 2015.2
     */
    runtime.prototype.toJSON = function () { };

    /**
     * Returns the object type name
     * @governance none
     * @return {string}
     *
     * @since 2015.2
     */
    runtime.prototype.toString = function () { };

    /**
     * Holds all possible environment types that the current script can execute in. This is the type for the runtime.envType property.
     * @enum {string}
     * @readonly
     */
    function runtimeEnvType() {
        this.SANDBOX = 'SANDBOX';
        this.PRODUCTION = 'PRODUCTION';
        this.BETA = 'BETA';
        this.INTERNAL = 'INTERNAL';
    }

    runtime.prototype.EnvType = new runtimeEnvType();

    /**
     * Holds the context values for script triggers. This is the type for the runtime.executionContext property.
     * @name runtime#ContextType
     * @type {Object}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.prototype.ContextType = undefined;
    /**
     * Holds the user permission level for a specific permission ID. User.gerPermission(options) returns a value from this enum.
     * @enum {number}
     * @readonly
     */
    function runtimePermission() {
        this.FULL = 4.0;
        this.EDIT = 3.0;
        this.CREATE = 2.0;
        this.VIEW = 1.0;
        this.NONE = 0.0;
    }

    runtime.prototype.Permission = new runtimePermission();

    /**
     * @exports N/runtime
     * @namespace runtime
     */
    return new runtime();
});