define([], function () {
    /**
     * SuiteScript suiteAppInfo module
     *
     * A module exposing a set of handy functions
     * to read information about bundles and suite apps.
     *
     * @module N/suiteAppInfo
     * @NApiVersion 2.x
     */
    var suiteAppInfo = function () { };

    /**
     * Tells whether the given bundle is installed.
     *
     * @param {Object} options
     * @param {int} options.bundleId
     * @return {boolean}
     * @governance 5
     * @since 2021.1
     */
    suiteAppInfo.prototype.isBundleInstalled = function (options) { }

    /**
     * Returns a list of installed bundles.
     *
     * Unlike at `/app/bundler/bundlelist.nl`, this function
     * returns only bundles that were successfuly installed.
     *
     * @param {Object} [options]
     * @return {Array<Bundle>}
     * @governance 10
     * @since 2021.1
     */
    suiteAppInfo.prototype.listInstalledBundles = function (options) { }

    /**
     * Lists ID-s of bundles that contain a script,
     * for each given script individually.
     *
     * @param {Object} options
     * @param {Array<string>} options.scriptIds
     * @return {Object<string,Array<int>>} A `{ scriptId: arrayOfBundleIds }` mapping.
     * @governance 10
     * @since 2021.1
     */
    suiteAppInfo.prototype.listBundlesContainingScripts = function (options) { }

    /**
     * Tells whether the given suite app is installed.
     *
     * @param {Object} options
     * @param {string} options.suiteAppId
     * @return {boolean}
     * @governance 5
     * @since 2021.1
     */
    suiteAppInfo.prototype.isSuiteAppInstalled = function (options) { }

    /**
     * Returns a list of installed suite apps.
     *
     * Unlike at `/app/suiteapp/devframework/appinstalllist.nl`, this function
     * returns only suite apps that were successfuly installed.
     *
     * @param {Object} [options]
     * @return {Array<SuiteApp>}
     * @governance 10
     * @since 2021.1
     */
    suiteAppInfo.prototype.listInstalledSuiteApps = function (options) { }

    /**
     * Lists ID-s of suite apps that contain a script,
     * for each given script individually.
     *
     * @param {Object} options
     * @param {Array<string>} options.scriptIds
     * @return {Object.<String,null|String>} A `{ scriptId: suiteAppId|null }` mapping.
     * @governance 10
     * @since 2021.1
     */
    suiteAppInfo.prototype.listSuiteAppsContainingScripts = function (options) { }

    /**
     * @exports N/suiteAppInfo
     * @namespace suiteAppInfo
     */
    return new suiteAppInfo();
});