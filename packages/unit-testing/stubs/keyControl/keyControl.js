define(['./Key'], function (Key) {
    /**
     * SuiteScript module
     *
     * @module N/keyControl
     * @NApiVersion 2.x
     *
     */
    var keyControl = function () { };

    /**
     * @enum {string}
     * @readonly
     */
    function keyControlOperator() {
        this.STARTS_WITH = 'startswith';
        this.CONTAINS = 'contains';
        this.ENDS_WITH = 'endswith';
        this.EQUALS = 'equals';
    }

    keyControl.prototype.Operator = new keyControlOperator();

    /**
     * Creates a key object
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {File} options.file File object containing the key
     * @param {string} [options.password] Password for the key file (can be in a form of guid token or secret - "custsecret...")
     * @param {string} [options.scriptId] Desired scriptId under which this key should be later saved
     * @param {string} options.name Name of the key
     * @param {string} [options.description] Description for this key
     * @param {Array<string>} [options.scriptRestrictions] Array of scripts allowed to use the key
     * @param {Array<number>} [options.restrictions] Array of entities which can use the key
     * @return {Key}
     *
     * @since 2019.2
     */
    keyControl.prototype.createKey = function (options) { }

    /**
     * Deletes a key
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.scriptId Id of the key to delete
     * @return {Object} Object containing scriptId property of deleted key
     *
     * @since 2019.2
     */
    keyControl.prototype.deleteKey = function (options) { }

    /**
     * Loads a key
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.scriptId Id of the key to load
     * @return {Key}
     *
     * @since 2019.2
     */
    keyControl.prototype.loadKey = function (options) { }

    /**
     * Locks a key, so it is not editable in UI
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.id id of the key to lock
     * @throws {error.SuiteScriptError} KEY_NOT_FOUND when the key with such id does not exist
     * @throws {error.SuiteScriptError} ACCESS_TO_KEY_RESTRICTED when current entity/script has no permission to lock the key
     * @throws {error.SuiteScriptError} KEY_ALREADY_LOCKED when the key is already locked
     * @return {void}
     *
     * @since 2021.1
     */
    keyControl.prototype.lock = function (options) { }

    /**
     * Unlocks a key, so it is editable in UI
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.id id of the key to unlock
     * @throws {error.SuiteScriptError} KEY_NOT_FOUND when the key with such id does not exist
     * @throws {error.SuiteScriptError} ACCESS_TO_KEY_RESTRICTED when current entity/script has no permission to unlock the key
     * @throws {error.SuiteScriptError} KEY_NOT_LOCKED when the key is not locked
     * @return {void}
     *
     * @since 2021.1
     */
    keyControl.prototype.unlock = function (options) { }

    /**
     * Returns a list of keys available to the user the script is run under.
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {number} options.restriction (optional) filter
     * @param {string} options.scriptRestriction (optional) filter
     * @param {string|Object} options.name (optional) filter
     * @param {string|Object} options.description (optional) filter
     *
     * @return {Object} metadata about key
     */
    keyControl.prototype.findKeys = function (options) { }

    /**
     * @exports N/keyControl
     * @namespace keyControl
     */
    return new keyControl();
});