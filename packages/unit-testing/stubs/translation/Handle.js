define([], function() {
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
        this.toJSON = function () { };

        /**
         * Returns the object type name (translations.Handle)
         *
         * @returns {string}
         */
        this.toString = function () { };
    }
    
    return new Handle();
});