define([], function() {
    /**
     * Return a new instance of ClientResponse used to store the result of a HTTP request.
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
         * Response code.
         * @name ClientResponse#code
         * @type number
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */        
        this.code = undefined;        
        /**
         * Response headers.
         * @name ClientResponse#headers
         * @type Object
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */        
        this.headers = undefined;        
        /**
         * Response body.
         * @name ClientResponse#body
         * @type string
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */        
        this.body = undefined;        
        /**
         * Returns the object type name (http.ClientResponse)
         *
         * @returns {string}
         */        
        this.toString = function() {};        
        
        /**
         * JSON.stringify() implementation.
         *
         * @returns {{type: string, code: *, headers: *, body: *}}
         */        
        this.toJSON = function() {};        
    }    
    
    return new ClientResponse();
});