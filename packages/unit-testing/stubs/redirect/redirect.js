define(['../search/SearchInstance'], function (Search) {
    /**
     * SuiteScript module
     *
     * @module N/redirect
     * @NApiVersion 2.x
     *
     */
    var redirect = function() {};

    /**
     * Redirect to a URL
     *
     * @governance none
     * @restriction Can only direct to external URL by suitelet without login
     *
     * @param {Object} options
     * @param {string} options.url url to redirect to
     * @param {Object} [options.parameters] url parameters of the redirect
     *
     * @since 2015.2
     */
    redirect.prototype.redirect = function (options) { };

    /**
     * Redirect to a suitelet
     *
     * @governance none
     * @restriction Suitelet and UE only
     *
     * @param {Object} options
     * @param {string} options.scriptId  script Id
     * @param {string} options.deploymentId deployment Id
     * @param {boolean} options.isExternal (optional) default to false indicate it is external Suitelet URL
     * @param {Object} options.parameters (optional)
     *
     * @since 2015.2
     */
    redirect.prototype.toSuitelet = function (options) { };

    /**
     * Redirect to a record
     *
     * @governance none
     * @restriction Suitelet and UE only
     *
     * @param {Object} options
     * @param {string} options.type record type
     * @param {string} options.id  record Id
     * @param {boolean} [options.isEditMode] defaults to false
     * @param {Object} [options.parameters] url parameters
     */
    redirect.prototype.toRecord = function (options) { };

    /**
     * Redirect to a record transform
     *
     * @governance none
     * @restriction Suitelet and UE only
     *
     * @param {Object} options
     * @param {string} options.toType record type to transform to
     * @param {string} options.fromId  record id of the record to transform from
     * @param {string} options.fromType record type to transform from
     * @param {Object} [options.parameters] url parameters
     *
     * @since 2020.1
     */
    redirect.prototype.toRecordTransform = function (options) { };

    /**
     * Redirect to a task link
     *
     * @governance none
     * @restriction Suitelet and UE only
     *
     * @param {Object} options
     * @param {string} options.id task Id
     * @param {Object} [options.parameters] url parameters
     *
     * @since 2015.2
     */
    redirect.prototype.toTaskLink = function (options) { };

    /**
     * Redirect to saved search
     *
     * @governance 5 units
     * @restriction Supported only by afterSubmit user event scripts and client scripts
     *
     * @param {Object} options
     * @param {number} options.id search id
     *
     * @since 2015.2
     */
    redirect.prototype.toSavedSearch = function (options) { };

    /**
     * Redirect to saved search results
     *
     * @governance 5 units
     * @restriction Supported only by afterSubmit user event scripts and client scripts
     *
     * @param {Object} options
     * @param {number} options.id id of a saved search to redirect to
     *
     * @since 2015.2
     */
    redirect.prototype.toSavedSearchResult = function (options) { };

    /**
     * Redirect to search
     *
     * @governance none
     * @restriction Supported only by afterSubmit user event scripts and client scripts
     *
     * @param {Object} options
     * @param {Search} options.search Search object to redirect to
     *
     * @since 2015.2
     */
    redirect.prototype.toSearch = function (options) { };

    /**
     * Redirect to search results
     *
     * @governance none
     * @restriction Supported only by afterSubmit user event scripts and client scripts
     *
     * @param {Object} options
     * @param {Search} options.search Search object of which results to redirect to
     */
    redirect.prototype.toSearchResult = function (options) { };

    /**
     * @exports N/redirect
     * @namespace redirect
     */
    return new redirect();
});