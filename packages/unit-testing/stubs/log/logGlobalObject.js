/**
 * SuiteScript log global object
 * @namespace
 * @global
 * @name log
 * @type {Object}
 */
 var log = {
    /**
     * Logs a Debug type log message to the Execution Log tab of the script deployment for the current script. This entry does not appear on the Execution Log tab if the Log Level field for the script deployment is set to Audit or above. Use this method for scripts in development.
     * @governance none
     * @param {Object} options
     * @param {*} options.title     String displayed in the Title column on the Execution Log tab of the script deployment.
     * @param {*} [options.details] String displayed in the Details column on the Execution Log tab of the script deployment.
     * @return {void}
     *
     * @since 2015.2
     */
    debug: function (options){},

    /**
     * Logs an Audit type log message to the Execution Log tab of the script deployment for the current script. This entry will not appear on the Execution Log tab if the Log Level field for the script deployment is set to Error or above. Use this method for scripts in production.
     * @governance none
     * @param {Object} options
     * @param {*} options.title     String displayed in the Title column on the Execution Log tab of the script deployment.
     * @param {*} [options.details] String displayed in the Details column on the Execution Log tab of the script deployment.
     * @return {void}
     *
     * @since 2015.2
     */
    audit: function (options){},

    /**
     * Logs an Error type log message to the Execution Log tab of the script deployment for the current script. This entry will not appear on the Execution Log tab if the Log Level field for the script deployment is set to Emergency or above. Use this method for scripts in production.
     * @governance none
     * @param {Object} options
     * @param {*} options.title     String displayed in the Title column on the Execution Log tab of the script deployment.
     * @param {*} [options.details] String displayed in the Details column on the Execution Log tab of the script deployment.
     * @return {void}
     *
     * @since 2015.2
     */
    error: function (options){},

    /**
     * Logs an Emergency type log message to the Execution Log tab of the script deployment for the current script. Use this method for scripts in production.
     * @governance none
     * @param {Object} options
     * @param {*} options.title     String displayed in the Title column on the Execution Log tab of the script deployment.
     * @param {*} [options.details] String displayed in the Details column on the Execution Log tab of the script deployment.
     * @return {void}
     *
     * @since 2015.2
     */
    emergency: function (options){}
};