define([], function() {
    /**
     * Encapsulates the response of an HTTP client request (i.e., the return type for http.delete(options), http.get(options), http.post(options), http.put(options), http.request(options), and corresponding promise methods).
     *
     * @protected
     * @classDescription Encapsulation of the response returned by a web server as a response to our HTTP request.
     * @return {http.ClientResponse}
     * @constructor
     *
     * @since 2015.2
     */
    function ClientResponse() {

        /**
         * The client response code.
         * @name ClientResponse#code
         * @type number
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.code = undefined;
        /**
         * The response headers.
         * @name ClientResponse#headers
         * @type Object
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.headers = undefined;
        /**
         * The client response body.
         * @name ClientResponse#body
         * @type string
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.body = undefined;
        /**
         * Returns the object type name (http.ClientResponse)
         * @governance none
         * @returns {string}
         *
         * @since 2015.2
         */
        this.toString = function() {};
    
        /**
         * get JSON format of the object
         * @governance none
         * @returns {{type: string, code: *, headers: *, body: *}}
         *
         * @since 2015.2
         */
        this.toJSON = function() {};
    }

    return new ClientResponse();
});
