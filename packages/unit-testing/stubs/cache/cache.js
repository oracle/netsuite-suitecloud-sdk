define(['./CacheInstance'], function (Cache) {
    /**
     * SuiteScript module
     *
     * @module N/cache
     * @NApiVersion 2.x
     *
     */
    var cache = function() {};

    /**
     * Get a named, scoped cache.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {string} options.name The cache name. If a cache does not exist with the given name it will be created and returned. The maximum size for the cache name is 1K.
     * @param {string} [options.scope] The cache scope (optional). The default cache scope is SCRIPT.
     *
     * @return {Cache}
     *
     * @since 2016.2
     */
    cache.prototype.getCache = function (options) { };

    /**
     * Defines all possible cache scopes.
     *
     * PRIVATE (default) - Cache entries are only accessible to the current script.
     * PROTECTED - Cache entries are only accessible to scripts in the same bundle or not in bundle.
     * PUBLIC - Cache entries are accessible to any script running in your account.
     *
     * @enum {string}
     * @readonly
     */
    function cacheScope() {
        this.PRIVATE = 'PRIVATE';
        this.PROTECTED = 'PROTECTED';
        this.PUBLIC = 'PUBLIC';
    }
    cache.prototype.Scope = new cacheScope();

    /**
     * @exports N/cache
     * @namespace cache
     */
    return new cache();
});