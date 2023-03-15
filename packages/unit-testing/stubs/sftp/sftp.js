define(['./Connection'], function (Connection) {
    /**
     * SuiteScript module
     *
     * @private
     * @module N/sftp
     * @suiteScriptVersion 2.x
     *
     */
    var sftp = function () { };

    /**
     *
     * Establishes a connection with a remote server and returns a connection object representing that connection
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.username - the username of remote account
     * @param {string} [options.passwordGuid] - the password guid for remote account
     * @param {string} [options.secret] - the secret for remote account
     * @param {string} [options.keyId] - id of the private key to use
     * @param {string} options.url - host of remote account
     * @param {number} [options.port] - port through which to connect to remote account, defaults to 22
     * @param {string} [options.directory] - remote directory of connection
     * @param {number} [options.timeout] - timeout to establish connection, defaults to Connection.MAX_CONNECT_TIMEOUT
     * @param {string} options.hostKey - hostKey for ssh server
     * @param {string} [options.hostKeyType] - hostKeyType for ssh server, one of rsa, dsa, ecdsa
     *
     * @returns {Connection} connection - an object that represents the connection
     *
     * @throws {SuiteScriptError} FTP_UNKNOWN_HOST - thrown when host cannot be found
     * @throws {SuiteScriptError} FTP_CONNECT_TIMEOUT_EXCEEDED - thrown when connection takes longer than options.timeout seconds
     * @throws {SuiteScriptError} FTP_CANNOT_ESTABLISH_CONNECTION - thrown when connection fails because of invalid username or password or no permission to access to directory
     * @throws {SuiteScriptError} FTP_INVALID_PORT_NUMBER - thrown when format of port number is invalid (e.g. negative or greater than 65535)
     * @throws {SuiteScriptError} FTP_INVALID_CONNECTION_TIMEOUT - thrown when timeout parameter is set greater than Connection.MAX_CONNECT_TIMEOUT (currently 20 seconds) or negative
     * @throws {SuiteScriptError} FTP_INVALID_DIRECTORY - thrown if directory does not exist on server
     * @throws {SuiteScriptError} FTP_INCORRECT_HOST_KEY - thrown if provided host key does not match remote server's presented host key
     * @throws {SuiteScriptError} FTP_INCORRECT_HOST_KEY_TYPE - thrown if the host key type does not match the type of the provided host key
     * @throws {SuiteScriptError} FTP_MALFORMED_HOST_KEY - thrown when host key is not of the correct format (e.g. base 64, 96+ bytes)
     * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
     * @throws {SuiteScriptError} FTP_UNSUPPORTED_ENCRYPTION_ALGORITHM - thrown when the remote server does not support one of NetSuite's approved algorithms
     * @throws {SuiteScriptError} AUTHENTICATION_FAIL_TOO_MANY_INCORRECT_AUTHENTICATION_ATTEMPTS - thrown when number of incorrect authentication attempts is reached
     * @throws {SuiteScriptError} NO_ROUTE_TO_HOST_FOUND - thrown when host cannot be found on the network
     * @throws {SuiteScriptError} CONNECTION_RESET - thrown when the connection is closed prematurely
     * @throws {SuiteScriptError} CONNECTION_CLOSED_BY_HOST - thrown when host does not accept the connection
     * @throws {SuiteScriptError} THE_REMOTE_PATH_FOR_FILE_IS_NOT_VALID - thrown when base directory does not exist on remote server
     * @throws {SuiteScriptError} SFTPCREDENTIAL_ENCODING_ERROR - thrown when credentials are incorrectly encoded
     * @throws {SuiteScriptError} UNABLE_TO_GET_SFTP_SERVER_ADDRESS - thrown when some error occurred while determining remote server address
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when any require parameter is missing
     * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when any parameter has incorrect type
     * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS when both passwordGuid and secret are defined
     *
     * @since 2016.1
     */
    sftp.prototype.createConnection = function (options) { };

    /**
     * @exports N/sftp
     * @namespace sftp
     */
    return new sftp();
});