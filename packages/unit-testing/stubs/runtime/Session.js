define([], function () {
    /**
     * @class Session
     * @classdesc Class representing current session
     * @protected
     * @constructor
     */
     function Session() {

        /**
         * Returns the user-defined session object value associated with a session object key. Both the session object value and associated key are defined using Session.set(options). If the key does not exist, this method returns null.
         * @governance none
         * @param {Object} options
         * @param {string} options.name The key used to store the session object
         * @return {string|null}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         */
        this['get'] = function (options) { };

        /**
         * Add or set the value of a user-defined session object for the current user.
         * @governance none
         * @param {Object} options
         * @param {string} options.name The key used to store the session object
         * @param {string} options.value The value to associate with this key in the user's session
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         */
        this['set'] = function (options) { };

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

    return new Session();
});