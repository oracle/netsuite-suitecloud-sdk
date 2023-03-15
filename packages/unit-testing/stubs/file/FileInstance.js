define(['./Reader'], function (Reader) {
    /**
     * Return a new instance of file.File used for accessing and manipulating files in the file cabinet.
     *
     * @protected
     * @class File
     * @classdesc Encapsulation of files (media items) in the file cabinet.
     * @alias file.File
     *
     * @since 2015.2
     */
    function File() {

        /**
        The id of the file (if stored in the FC).
         * @name File#id
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.id = undefined;
        /**
        The size of the file in bytes.
         * @name File#size
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.size = undefined;
        /**
        Return the URL of the file (if stored in the FC).
         * @name File#url
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.url = undefined;
        /**
        The path to the file in the file cabinet.
         * @name File#path
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.path = undefined;
        /**
        The type of the file.
         * @name File#fileType
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.fileType = undefined;
        /**
         * Indicates whether or not the file is text-based or binary.
         * @name File#isText
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.isText = undefined;
        /**
         * The character encoding for the file.
         * @name File#encoding
         * @type {string}
         *
         * @since 2015.2
         */
        this.encoding = undefined;
        /**
         * The name of the file.
         * @name File#name
         * @type {string}
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * The internal ID of the folder that this file is in.
         * @name File#folder
         * @type {number}
         *
         * @since 2015.2
         */
        this.folder = undefined;
        /**
         * The file description.
         * @name File#description
         * @type {string}
         *
         * @since 2015.2
         */
        this.description = undefined;
        /**
         * The file's inactive status.
         * @name File#isInactive
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isInactive = undefined;
        /**
         * The file's "Available without Login" status.
         * @name File#isOnline
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isOnline = undefined;
        /**
         * @name File#lines
         * @type {Iterator} iterator - Iterator which provides the next line of text from the text file to the iterator function.
         *      <pre> file.lines.iterator().each(function(lineContext){...}); </pre>
         *
         * @throws {SuiteScriptError} YOU_CANNOT_READ_FROM_A_FILE_AFTER_YOU_BEGAN_WRITING_TO_IT if you call after having called appendLine
         * @readonly
         *
         * @since 2017.1
         */
        this.lines = undefined;
        /**
         * Returns iterator of segments delimited by separator
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.separator
         * @return {Iterator}
         *
         * @since 2019.1
         */
        this.getSegments = function (options) { };

        /**
         * Returns reader object for performing special read operations
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Reader}
         *
         * @since 2019.1
         */
        this.getReader = function () { };

        /**
         * Return the value (Base64 encoded for binary types) of the file.
         * Note: Contents are lazy loaded and must be less than 10MB in size in order to access.
         * @restriction Server SuiteScript only
         * @governance none
         * @throws {SuiteScriptError} SSS_FILE_CONTENT_SIZE_EXCEEDED when trying to get contents of a file larger than 10MB
         * @return {string}
         *
         * @since 2015.2
         */
        this.getContents = function () { };

        /**
         * Add/update a file in the file cabinet based on the properties of this object.
         * @restriction Server SuiteScript only
         * @governance 20 units
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when the folder property is not set
         * @throws {SuiteScriptError} INVALID_KEY_OR_REF if trying to save to a non-existing folder
         * @return {number} return internal ID of file in the file cabinet
         *
         * @since 2015.2
         */
        this.save = function () { };

        /**
         * Append a chunk of text to the file.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.value text to append
         * @return {File} Returns this file
         * @throws {SuiteScriptError} YOU_CANNOT_WRITE_TO_A_FILE_AFTER_YOU_BEGAN_READING_FROM_IT If you call it after having called FileLines#each
         * @since 2017.1
         */
        this.append = function (options) { };

        /**
         * Append a line of text to the file.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.value text to append
         * @return {File} Returns this file
         * @throws {SuiteScriptError} YOU_CANNOT_WRITE_TO_A_FILE_AFTER_YOU_BEGAN_READING_FROM_IT If you call it after having called FileLines#each
         * @since 2017.1
         */
        this.appendLine = function (options) { };

        /**
         * Reset the reading and writing streams that may have been opened by appendLine or FileLines#each
         * @restriction Server SuiteScript only
         * @governance none
         * @return {void}
         * @since 2017.1
         */
        this.resetStream = function () { };

        /**
         * Returns the object type name (file.File)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * JSON.stringify() implementation.
         * @restriction Server SuiteScript only
         * @governance none
         * @returns {{type: string, id: *, name: *, description: *, path: *, url: *, folder: *, fileType: *, isText: *,
         *     size: *, encoding: *, isInactive: *, isOnline: *, contents: *}}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    return new File();
});