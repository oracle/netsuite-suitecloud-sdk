/**
 * @NAPIVersion 2.1
 * @NScriptType CustomRecordActionScript
 */
define([${modulesDefine}],
    ${modulesJsDoc}
    (${moduleParameters}) => {
        /**
         * Defines the Custom Record Action qualifier entry point.
         * @param {Object} scriptContext
         * @param {List<String>} scriptContext.ids - List of record instances
         * @param {String} scriptContext.recordType - Record Type
         * @param {Map<String, String>} scriptContext.qualified - result of the qualifier which is a map of instances id to
         *     true/false
         * @since 2020.2
         */
        const isQualified = (scriptContext) => {

        }

        /**
         * Defines the Custom Record Action execution of action entry point.
         * @param {Object} scriptContext
         * @param {List<String>} scriptContext.ids - List of record instances
         * @param {String} scriptContext.recordType - Record Type
         * @param {Object} scriptContext.params - JSON Object with parameters passed from user
         * @param {Object} scriptContext.response - Result of the action which is a response JSON object
         * @since 2020.2
         */
        const executeAction = (scriptContext) => {

        }

        return {isQualified, executeAction}
    });