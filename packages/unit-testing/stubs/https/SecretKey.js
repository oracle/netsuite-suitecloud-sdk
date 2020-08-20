define([], function() {
    /**
     * Returns a new instance of SecretKey used for hmac, cipher and decipher
     *
     * @protected
     * @class
     * @classdesc
     * @param guid
     * @param encoding
     * @return {crypto.SecretKey}
     *
     * @constructor
     */    
    function SecretKey() {
        /**
         * The GUID associated with the secret key.
         * @name SecretKey#guid
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */        
        this.guid = undefined;        
        /**
         * The encoding used for the clear text value of the secret key.
         * @name SecretKey#encoding
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */        
        this.encoding = undefined;        
        /**
         * Returns the object type name (crypto.SecretKey)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */        
        this.toString = function() {};        
        
        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.1
         */        
        this.toJSON = function() {};   
    }

    return new SecretKey();
});