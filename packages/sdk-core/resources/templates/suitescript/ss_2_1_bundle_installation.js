/**
 * @NApiVersion 2.1
 * @NScriptType BundleInstallationScript
 */
define([${modulesDefine}],
    ${modulesJsDoc}
    (${moduleParameters}) => {
        /**
         * Defines the function that is executed before a bundle is installed for the first time in a target account.
         * @param {Object} params
         * @param {number} params.version - Version of the bundle being installed
         * @since 2016.1
         */
        const beforeInstall = (params) => {

        }

        /**
         * Defines the function that is executed after a bundle is installed for the first time in a target account.
         * @param {Object} params
         * @param {number} params.version - Version of the bundle being installed
         * @since 2016.1
         */
        const afterInstall = (params) => {

        }

        /**
         * Defines the function that is executed before a bundle in a target account is updated.
         * @param {Object} params
         * @param {number} params.fromVersion - Version of the bundle currently installed
         * @param {number} params.toVersion - New version of the bundle being installed
         * @since 2016.1
         */
        const beforeUpdate = (params) => {

        }

        /**
         * Defines the function that is executed after a bundle in a target account is updated.
         * @param {Object} params
         * @param {number} params.fromVersion - Version of the bundle currently installed
         * @param {number} params.toVersion - New version of the bundle being installed
         * @since 2016.1
         */
        const afterUpdate = (params) => {

        }

        /**
         * Defines the function that is executed before a bundle is uninstalled from a target account.
         * @param {Object} params
         * @param {number} params.version - Version of the bundle being uninstalled
         * @since 2016.1
         */
        const beforeUninstall = (params) => {

        }

        return {beforeInstall, afterInstall, beforeUpdate, afterUpdate, beforeUninstall}

    });