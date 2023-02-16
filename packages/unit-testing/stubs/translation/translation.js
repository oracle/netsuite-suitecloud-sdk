define(['./Handle'], function (Handle) {
    /**
     * Translation module
     *
     * @module N/translation
     * @NApiVersion 2.x
     */
    var translation = function () { };

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
    translation.prototype.get = function (options) { }

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
    translation.prototype.load = function (options) { }

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
    translation.prototype.selectLocale = function (options) { }

    /**
     * @enum
     */
    function translationLocale() {
        this.CURRENT = 'CURRENT';
        this.COMPANY_DEFAULT = 'COMPANY_DEFAULT';
        this.af_ZA = 'af_ZA';
        this.ar = 'ar';
        this.bg_BG = 'bg_BG';
        this.bn_BD = 'bn_BD';
        this.bs_BA = 'bs_BA';
        this.cs_CZ = 'cs_CZ';
        this.da_DK = 'da_DK';
        this.de_DE = 'de_DE';
        this.el_GR = 'el_GR';
        this.en = 'en';
        this.en_AU = 'en_AU';
        this.en_CA = 'en_CA';
        this.en_GB = 'en_GB';
        this.en_US = 'en_US';
        this.es_AR = 'es_AR';
        this.es_ES = 'es_ES';
        this.et_EE = 'et_EE';
        this.fa_IR = 'fa_IR';
        this.fi_FI = 'fi_FI';
        this.fr_CA = 'fr_CA';
        this.fr_FR = 'fr_FR';
        this.gu_IN = 'gu_IN';
        this.he_IL = 'he_IL';
        this.hi_IN = 'hi_IN';
        this.hr_HR = 'hr_HR';
        this.hu_HU = 'hu_HU';
        this.hy_AM = 'hy_AM';
        this.id_ID = 'id_ID';
        this.is_IS = 'is_IS';
        this.it_IT = 'it_IT';
        this.ja_JP = 'ja_JP';
        this.kn_IN = 'kn_IN';
        this.ko_KR = 'ko_KR';
        this.lb_LU = 'lb_LU';
        this.lt_LT = 'lt_LT';
        this.lv_LV = 'lv_LV';
        this.mr_IN = 'mr_IN';
        this.ms_MY = 'ms_MY';
        this.nl_NL = 'nl_NL';
        this.no_NO = 'no_NO';
        this.pa_IN = 'pa_IN';
        this.pl_PL = 'pl_PL';
        this.pt_BR = 'pt_BR';
        this.pt_PT = 'pt_PT';
        this.ro_RO = 'ro_RO';
        this.sh_RS = 'sh_RS';
        this.sk_SK = 'sk_SK';
        this.sl_SI = 'sl_SI';
        this.sq_AL = 'sq_AL';
        this.sr_RS = 'sr_RS';
        this.sv_SE = 'sv_SE';
        this.ta_IN = 'ta_IN';
        this.te_IN = 'te_IN';
        this.th_TH = 'th_TH';
        this.tl_PH = 'tl_PH';
        this.tr_TR = 'tr_TR';
        this.uk_UA = 'uk_UA';
        this.vi_VN = 'vi_VN';
        this.zh_CN = 'zh_CN';
        this.zh_TW = 'zh_TW';
    }

    translation.prototype.Locale = new translationLocale();

    /**
     * @exports N/translation
     * @namespace translation
     */
    return new translation();
});