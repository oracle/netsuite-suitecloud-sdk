/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([${modulesDefine}],
    ${modulesJsDoc}
    (${moduleParameters}) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

        }

        return {onRequest}

    });