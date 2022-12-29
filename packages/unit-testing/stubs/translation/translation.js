/**
 * Translation module
 *
 * @module N/translation
 * @NApiVersion 2.x
 */
define([], function(){        
    /**
     * @namespace translation
     */    
    var translation = {};    
            
    /**
     * Creates a translator function for the chosen key in the desired locale
     *
     * @param {string} options.collection - the scriptid of the collection the key is in
     * @param {string} options.key - a valid key from the collection
     * @param {Locale} [options.locale] - a valid locale from Locale enum or the session locale if not specified
     *
     * @return {Function} - returns a translator function
     *
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if collection or key is missing
     * @throws {SuiteScriptError} INVALID_TRANSLATION_KEY if key is of an invalid format
     * @throws {SuiteScriptError} INVALID_TRANSLATION_COLLECTION if collection is of an invalid format
     * @throws {SuiteScriptError} INVALID_LOCALE if locale is of an invalid format
     * @throws {SuiteScriptError} TRANSLATION_KEY_NOT_FOUND if translation key was not found
     *
     * @since 2019.1
     */    
    function get() {    
    }    
        
    /**
     * Pre-loads a translations.Handle with translations for the specified collections and locales.
     * If no locale was specified the session locale (Locale.CURRENT) will be used as the handler's locale.
     * If locales were specified the first locale in the array will be used as the handler's locale.
     *
     * @param {Array} options.collections - a list of objects defining the collections to be loaded
     * @param {String} options.collections.alias - an alias used later in the script to refer to the collection to be loaded
     * @param {String} options.collections.collection - the scriptid of the collection to be loaded
     * @param {Array} [options.collections.keys] - a list of translation keys from the collection to be loaded
     * @param {Array} [options.locales] - a list of valid locales
     *
     * @return {Handle} - returns a translations.Handle
     *
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE if collections, collections or locales are not of Array type
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if collections doesn't have at least one collection defined
     * @throws {SuiteScriptError} INVALID_TRANSLATION_KEY if a key has an invalid format
     * @throws {SuiteScriptError} INVALID_TRANSLATION_COLLECTION if a collection has an invalid format
     * @throws {SuiteScriptError} INVALID_ALIAS if an alias has an invalid format
     * @throws {SuiteScriptError} INVALID_LOCALE if a locale is of an invalid format
     *
     * @since 2019.1
     */    
    function load() {    
    }    
        
    /**
     * Creates a translations.Handle from an existing Handle for a specific locale
     *
     * @param {Handle} options.handle - a translations.Handle object
     * @param {Locale} options.locale - a valid locale supported by the handle
     *
     * @return {Handle} - returns a translations.Handle in the specified locale
     *
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if handle or locale is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE if handle is not a translations.Handle object
     * @throws {SuiteScriptError} INVALID_LOCALE if an unknown or unsupported locale is used in the scope of the handle
     * @throws {SuiteScriptError} TRANSLATION_HANDLE_IS_IN_AN_ILLEGAL_STATE if the handle passed is in an illegal state
     *
     * @since 2019.1
     */    
    function selectLocale() {    
    }    
        
    /**
     * Translations.Handle has a hierarchical structure.
     *
     * Each of its nodes is either another Handle or a translator function
     */    
    function Handle() {    
        
        /**
         * JSON.stringify() implementation.
         *
         * @returns {{type: string, allRawTranslations: Object, allTranslations: Object, locales: Array, recentLocale: Locale}}
         */        
        this.toJSON = function() {};        
        
        /**
         * Returns the object type name (translations.Handle)
         *
         * @returns {string}
         */        
        this.toString = function() {};        
    }    
    
    N.translation = translation;
    
    /**
     * @exports N/translation
     */
    return translation;
});