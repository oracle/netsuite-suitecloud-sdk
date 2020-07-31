define([], function() {
    /**
     *
     * @protected
     * @constructor
     */    
    function SecureString() {    
        
        /**
         *
         * @param {Object} options
         * @param {string} options.toEncoding
         * @returns {SecureString}
         */        
        this.convertEncoding = function(options) {};        
        
        /**
         *
         * @param {Object} options
         * @param {string} options.input
         * @param {string} options.inputEncoding
         * @returns {SecureString}
         */        
        this.appendString = function(options) {};        
        
        /**
         *
         * @param {Object} options
         * @param {SecureString} options.secureString
         * @returns {SecureString}
         */        
        this.appendSecureString = function(options) {};        
        
        /**
         *
         * @param {Object} options
         * @param {string} options.algorithm
         * @returns {SecureString}
         */        
        this.hash = function(options) {};        
        
        /**
         *
         * @param {Object}options
         * @param {string} options.algorithm
         * @param {SecretKey} options.key
         * @returns {SecureString}
         */        
        this.hmac = function(options) {};        
    }    
    
    return new SecureString();
});