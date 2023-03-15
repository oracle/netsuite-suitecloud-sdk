define([], function () {
    /**
     * @class User
     * @classdesc Class representing current user
     * @protected
     * @constructor
     */
     function User() {

        /**
         * The email address of the current user. To use this property, the email field on the user employee record must contain an email address.
         * @name User#email
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.email = undefined;
        /**
         * The name of the current user.
         * @name User#name
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * The internal ID of the location of the current user.
         * @name User#location
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.location = undefined;
        /**
         * The internal ID of the department for the current user.
         * @name User#department
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.department = undefined;
        /**
         * The internal ID of the role for the current user.
         * @name User#role
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.role = undefined;
        /**
         * The string value of the center type, or role center, for the current user.
         * @name User#roleCenter  The string value of the logged in user's center - for example, SALES, ACCOUNTING, CLASSIC.
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.roleCenter = undefined;
        /**
         * The custom scriptId of the role for the current user. You can use this value instead of User.role.
         * @name User#roleId
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.roleId = undefined;
        /**
         * The internal ID of the current user.
         * @name User#id
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The internal ID of the currently logged-in contact. If no logged-in entity or other entity than contact is logged in, then 0 is returned
         * @name User#contact
         * @type {number}
         * @readonly
         *
         * @since 2019.1
         */
        this.contact = undefined;
        /**
         * The internal ID of the subsidiary for the current user.
         * @name User#subsidiary
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.subsidiary = undefined;
        /**
         * Get a user's permission level for a given permission, which is a value from runtime.Permission enum
         * @governance none
         * @param {Object} options
         * @param {string} options.name The internal ID of a permission
         * @return {string} one value of the Permission
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         */
        this.getPermission = function (options) { };

        /**
         * Returns the value set for a NetSuite preference. Currently only General Preferences and Accounting Preferences are exposed in SuiteScript.
         * @governance none
         * @param {Object} options
         * @param {string} name The internal ID of the preference
         * @return {string} The value of a NetSuite preference for the current user
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         *
         */
        this.getPreference = function (options) { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {string}
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

    return new User();
});