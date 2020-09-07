define(['./ClientResponse'], function(ClientResponse){
    /**
     * SuiteScript module
     *
     * @module N/http
     * @suiteScriptVersion 2.x
     *
     */
    var http = function() {};

    /**
     * Enum describing available HTTP methods. Holds the string value for supported HTTP requests. This enum is used to set the value of http.request and ServerRequest.method.
     * @enum {string}
     * @readonly
     */
    function httpMethod() {
        this.GET = 'GET';
        this.POST = 'POST';
        this.PUT = 'PUT';
        this.DELETE = 'DELETE';
        this.HEAD = 'HEAD';
    }

    http.prototype.Method = new httpMethod();

    /**
     * Enum describing available Commerce API Cache Durations. Holds the string value for supported cache durations. This enum is used to set the value of the ServerResponse.setCdnCacheable property.
     * @enum {string}
     * @readonly
     */
    function httpCacheDuration() {
        this.UNIQUE = 'UNIQUE';
        this.SHORT = 'SHORT';
        this.MEDIUM = 'MEDIUM';
        this.LONG = 'LONG';
    }

    http.prototype.CacheDuration = new httpCacheDuration();

    /**
     * Send a HTTP GET request and return a reponse from a server.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.url the HTTP URL being requested
     * @param {Object} options.headers (optional) The HTTP headers
     * @return {ClientResponse}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required argument is missing
     * @throws {SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */
    http.prototype['get'] = function(options) {};
    http.prototype['get'].promise = function(options) {};

    /**
     * Send a HTTP POST request and return a reponse from a server.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.url the HTTP URL being requested
     * @param {string|Object} options.body The POST data
     * @param {Object} [options.headers] The HTTP headers
     * @return {ClientResponse}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required argument is missing
     * @throws {SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */
    http.prototype.post = function(options) {};
    http.prototype.post.promise = function(options) {};

    /**
     * Send a HTTP PUT request and return a reponse from a server.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.url the HTTP URL being requested
     * @param {string|Object} options.body The PUT data
     * @param {Object} [options.headers] The HTTP headers
     * @return {ClientResponse}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required argument is missing
     * @throws {SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */
    http.prototype.put = function(options) {};
    http.prototype.put.promise = function(options) {};

    /**
     * Send a HTTP DELETE request and return a reponse from a server.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.url the HTTP URL being requested
     * @param {Object} [options.headers] The HTTP headers
     * @return {ClientResponse}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required argument is missing
     * @throws {SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */
    http.prototype['delete'] = function(options) {};
    http.prototype['delete'].promise = function(options) {};

    /**
     * Send a HTTP request and return a response from a server.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.method The HTTP request method. Set using the http.Method enum.
     * @param {string} options.url the HTTP URL being requested
     * @param {string|Object} options.body The POST data; must be present if and only if method is POST
     * @param {Object} [options.headers] The HTTP headers
     * @return {ClientResponse}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required argument is missing
     * @throws {SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */
    http.prototype.request = function(options) {};
    http.prototype.request.promise = function(options) {};

    /**
     * @enum {string}
     * @readonly
     */
    function httpRedirectType() {
        this.RECORD = 'RECORD';
        this.SUITELET = 'SUITELET';
        this.RESTLET = 'RESTLET';
        this.MEDIA_ITEM = 'MEDIAITEM';
        this.TASK_LINK = 'TASKLINK';
    }

    http.prototype.RedirectType = new httpRedirectType();

    /**
     * @exports N/http
     * @namespace http
     */
    return new http();
});