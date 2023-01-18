define([], function () {
    /**
     *
     * Return new instance of SftpConnection used for performing operations over a connection
     * @class Connection
     * @classdesc Class through which various SFTP operations can be performed
     * @protected
     * @constructor
     *
     * @since 2016.1
     */
    function Connection() {

        /**
         * Constant representing the max time allowed for transferring data over connection
         * @name Connection#MAX_TRANSFER_TIMEOUT
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2016.1
         */
        this.MAX_TRANSFER_TIMEOUT = undefined;
        /**
         * Constant representing the max file size allowed to be transferred
         * @name Connection#MAX_FILE_SIZE
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2016.1
         */
        this.MAX_FILE_SIZE = undefined;
        /**
         * Uploads a file to a specified remote server
         * @restriction Server SuiteScript only
         * @governance 100 units
         *
         * @param {Object} options
         * @param {string} [options.directory] - relative path to directory where file will be uploaded. defaults to current directory,
         * @param {string} [options.filename] - name to give uploaded file on server, defaults to filename of options.file parameter illegal characters will be automatically escaped
         * @param {File} options.file - file to upload
         * @param {number} [options.timeout] - timeout for data transfer, defaults to Connection.MAX_TRANSFER_TIMEOUT (very large number TBD)
         * @param {boolean} options.replaceExisting - if true, will replace file on server if a file with options.filename is found at options.directory,
         * if false, will throw an exception if a file with options.filename is found at options.directory,
         * defaults to false
         * @return {void}
         *
         * @throws {SuiteScriptError} FTP_NO_SUCH_FILE_OR_DIRECTORY - thrown if directory does not exist on server
         * @throws {SuiteScriptError} FTP_TRANSFER_TIMEOUT_EXCEEDED - thrown if transfer takes longer than options.timeout seconds
         * @throws {SuiteScriptError} FTP_INVALID_TRANSFER_IMEOUT - thrown when timeout parameter is set greater than Connection.MAX_TRANSFER_TIMEOUT (currently 300 seconds) or negative
         * @throws {SuiteScriptError} FTP_FILE_ALREADY_EXISTS - thrown when replaceExisting is set to false and a file with the same name exists in remote directory
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} CONNECTION_RESET - thrown when the connection is closed prematurely
         * @throws {SuiteScriptError} CONNECTION_CLOSED_BY_HOST - thrown when host does not accept the connection
         * @throws {SuiteScriptError} THE_REMOTE_PATH_FOR_FILE_IS_NOT_VALID - thrown when base directory does not exist on remote server
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when any required parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when any parameter has incorrect type
         *
         * @since 2016.1
         */
        this.upload = function (options) { };

        /**
         * Lists remote directory
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string} [options.path] - relative path to directory of file that will be downloaded. defaults to current directory,
         * @param {string} [options.sort] - sort option (values from Sort enum are accepted)
         *
         * @return {Array<Object>} entries containing size, directory flag, last modification date,
         *
         * @throws {SuiteScriptError} FTP_INVALID_DIRECTORY - thrown if directory does not exist on server
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when options parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when any parameter has incorrect type
         *
         * @since 2019.2
         */
        this.list = function (options) { };

        /**
         * Moves a file or directory from one location to another
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string} [options.from] - relative path of file to be moved
         * @param {string} [options.to] - resulting path
         * @return {void}
         *
         * @throws {SuiteScriptError} FTP_INVALID_MOVE - Thrown when either source or target path is invalid
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when from or to parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when any parameter has incorrect type
         *
         * @since 2019.2
         */
        this.move = function (options) { };

        /**
         * Removes a file
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string} [options.path] - relative path of file to be deleted
         * @return {void}
         *
         * @throws {SuiteScriptError} FTP_NO_SUCH_FILE_OR_DIRECTORY - thrown if file does not exist on server
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when path parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when path is not string
         *
         * @since 2019.2
         */
        this.removeFile = function (options) { };

        /**
         * Removes an empty directory
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string} [options.path] - relative path of a directory to be deleted
         * @return {void}
         *
         * @throws {SuiteScriptError} FTP_DIRECTORY_NOT_FOUND - thrown if directory does not exist on server
         * @throws {SuiteScriptError} FTP_DIRECTORY_NOT_EMPTY - thrown if directory on remove server does not exist
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when path parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when path is not string
         *
         * @since 2019.2
         */
        this.removeDirectory = function (options) { };

        /**
         * Creates an empty directory
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @param {Object} options
         * @param {string} [options.path] - relative path of a directory to be created
         * @return {void}
         *
         * @throws {SuiteScriptError} FTP_DIRECTORY_NOT_FOUND - thrown if directory does not exist on server
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when path parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when path is not string
         *
         * @since 2019.2
         */
        this.makeDirectory = function (options) { };

        /**
         * Downloads a file from the remote server
         * @restriction Server SuiteScript only
         * @governance 100 units
         * @param {Object} options
         * @param {string} [options.directory] - relative path to directory of file that will be downloaded. defaults to current directory,
         * @param {string} options.filename - name of file to download to local machine
         * @param {number} [options.timeout] - timeout for data transfer, defaults to Connection.MAX_TRANSFER_TIMEOUT (currently 300 seconds)
         *
         * @return {File} file
         *
         * @throws {SuiteScriptError} FTP_MAXIMUM_FILE_SIZE_EXCEEDED - thrown if file size is > max file size allowed by NetSuite
         * @throws {SuiteScriptError} FTP_NO_SUCH_FILE_OR_DIRECTORY - thrown if directory or file does not exist on server
         * @throws {SuiteScriptError} FTP_TRANSFER_TIMEOUT_EXCEEDED - thrown if transfer takes longer than options.timeout seconds
         * @throws {SuiteScriptError} FTP_INVALID_TRANSFER_TIMEOUT - thrown when timeout parameter is set greater than Connection.MAX_TRANSFER_TIMEOUT (currently 300 seconds) or negative
         * @throws {SuiteScriptError} FTP_PERMISSION_DENIED - thrown when user does not have access to a file or directory on the remote server
         * @throws {SuiteScriptError} CONNECTION_RESET - thrown when the connection is closed prematurely
         * @throws {SuiteScriptError} CONNECTION_CLOSED_BY_HOST - thrown when host does not accept the connection
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when any required parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when any parameter has incorrect type
         *
         * @since 2016.1
         */
        this.download = function (options) { };
    }

    return new Connection();
});