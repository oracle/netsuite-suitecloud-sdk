define([], function () {
    /**
     * SuiteScript auth module
     *
     * @module N/auth
     * @suiteScriptVersion 2.x
     */
    var auth = function () { };

    /**
     * Change current user's email
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.password The logged in user's NetSuite password
     * @param {string} options.newEmail The logged in user's Netsuite email address
     * @param {boolean} [options.onlyThisAccount=true] If set to true, the email address change is applied only to roles within the current account. If set to false, the email address change is applicable to all accounts and roles
     * @return {void}
     * @throws {SuiteScriptError} INVALID_PSWD When password does not conform to rules.
     * @throws {SuiteScriptError} INVALID_EMAIL When email does not conform to rules.
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when some password or newEmail argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE onlyThisAccount is not boolean
     *
     * @since 2015.2
     */
    auth.prototype.changeEmail = function (options) { };

    /**
     * Change current user's NetSuite password
     * @restriction Server SuiteScript only
     * @governance none
     * @param {object} options
     * @param {string} options.currentPassword The logged in user's current NetSuite password
     * @param {string} options.newPassword The logged in user's new NetSuite password
     * @return {void}
     * @throws {SuiteScriptError} INVALID_PSWD When password does not conform to rules.
     * @throws {SuiteScriptError} INVALID_EMAIL When email does not conform to rules.
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when some currentPassworf or newPassword argument is missing
     *
     * @since 2015.2
     */
    auth.prototype.changePassword = function (options) { };

    /**
     * @exports N/auth
     * @namespace auth
     */
    return new auth();
});