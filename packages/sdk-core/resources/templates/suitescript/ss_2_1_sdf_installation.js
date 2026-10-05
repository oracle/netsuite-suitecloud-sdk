/**
 * @NAPIVersion 2.1
 * @NScriptType SDFInstallationScript
 */
define([${modulesDefine}],
    ${modulesJsDoc}
    (${moduleParameters}) => {
        /**
         * Defines what is executed when the script is specified by the SDF deployment(in the deploy.xml file of a SuiteCloud project).
         * @param {Object} scriptContext
         * @param {fromVersion} scriptContext.fromVersion - The version of the SuiteApp currently installed on the account. Specify null
         *     if this is a new installation.
         * @param {toVersion} scriptContext.toVersion - The version of the SuiteApp that will be installed on the account.
         * @since 2015.2
         */
        const run = (scriptContext) => {

        }
        return {run}
    });