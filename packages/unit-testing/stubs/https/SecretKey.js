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
         * @type string
         */        
        this.guid = undefined;
        /**
         * @type string
         */        
        this.encoding = undefined;
    }

    return new SecretKey();
});