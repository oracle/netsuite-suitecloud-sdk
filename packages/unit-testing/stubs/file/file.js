define(['./FileInstance'], function (File) {
    /**
     * SuiteScript file module
     *
     * @module N/file
     * @NApiVersion 2.x
     *
     */
    var file = function () { };

    /**
     * Instantiate a file object (specifying the name, type, and contents which are base-64 encoded for binary types.)
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {string} options.name file name
     * @param {string} options.fileType file type i.e. PLAINTEXT, HTMLDOC, PDF, WORD, see file.Type enum
     * @param {string} options.contents string containing file contents (must be base-64 encoded for binary types)
     * @param {number} [options.folder] (optional) the internal ID of the folder to be used when the file is saved
     * @return {File}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options is missing or one of mandatory options
     *     properties not set
     * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.fileType is an invalid type
     *
     * @since 2015.2
     */
    file.prototype.create = function (options) { };

    /**
     * Load a file from the file cabinet (via its internal ID or path).
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {number|string} options.id internal ID or path to file in the file cabinet (i.e. /SuiteScript/foo.js)
     * @return {File}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if idOrPath parameter is missing
     * @throws {SuiteScriptError} RCRD_DSNT_EXIST attempt to load a file from non-existing path
     * @throws {SuiteScriptError} INSUFFICIENT_PERMISSION attempt to load a file with non-existing ID
     *
     * @since 2015.2
     */
    file.prototype.load = function (options) { };

    /**
     * Delete a file from the file cabinet.
     *
     * @governance 20 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {number|string} options.id internal ID of file to be deleted
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if id parameter is missing
     *
     * @since 2015.2
     */
    file.prototype['delete'] = function (options) { };

    /**
     * Copies file to a different folder.
     *
     * @governance 20 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {number|string} options.id internal ID of file to be copied
     * @param {number|string} options.folder internal ID of target folder
     * @param {string} [options.conflictResolution] NameConflictResolution enum, way to handle conflict name resolution in the folder, the default value is 'FAIL'
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if id or folder parameter is missing
     * @throws {SuiteScriptError} INVALID_CONFLICT_RESOLUTION_1 if conflictResolution paramater has wrong value
     * @since 2021.1
     */
    file.prototype.copy = function (options) { };

    /**
     * Enum for file types.
     * @enum {string}
     * @readonly
     */
    function fileType() {
        this.APPCACHE = 'APPCACHE';
        this.AUTOCAD = 'AUTOCAD';
        this.BMPIMAGE = 'BMPIMAGE';
        this.CERTIFICATE = 'CERTIFICATE';
        this.CONFIG = 'CONFIG';
        this.CSV = 'CSV';
        this.EXCEL = 'EXCEL';
        this.FLASH = 'FLASH';
        this.FREEMARKER = 'FREEMARKER';
        this.GIFIMAGE = 'GIFIMAGE';
        this.GZIP = 'GZIP';
        this.HTMLDOC = 'HTMLDOC';
        this.ICON = 'ICON';
        this.JAVASCRIPT = 'JAVASCRIPT';
        this.JPGIMAGE = 'JPGIMAGE';
        this.JSON = 'JSON';
        this.MESSAGERFC = 'MESSAGERFC';
        this.MP3 = 'MP3';
        this.MPEGMOVIE = 'MPEGMOVIE';
        this.MSPROJECT = 'MSPROJECT';
        this.PDF = 'PDF';
        this.PJPGIMAGE = 'PJPGIMAGE';
        this.PLAINTEXT = 'PLAINTEXT';
        this.PNGIMAGE = 'PNGIMAGE';
        this.POSTSCRIPT = 'POSTSCRIPT';
        this.POWERPOINT = 'POWERPOINT';
        this.QUICKTIME = 'QUICKTIME';
        this.RTF = 'RTF';
        this.SCSS = 'SCSS';
        this.SMS = 'SMS';
        this.STYLESHEET = 'STYLESHEET';
        this.SVG = 'SVG';
        this.TAR = 'TAR';
        this.TIFFIMAGE = 'TIFFIMAGE';
        this.VISIO = 'VISIO';
        this.WEBAPPPAGE = 'WEBAPPPAGE';
        this.WEBAPPSCRIPT = 'WEBAPPSCRIPT';
        this.WORD = 'WORD';
        this.XMLDOC = 'XMLDOC';
        this.XSD = 'XSD';
        this.ZIP = 'ZIP';
    }

    file.prototype.Type = new fileType();

    /**
     * Enum for file encodings.
     * @enum {string}
     * @readonly
     */
    function fileEncoding() {
        this.UTF_8 = 'UTF-8';
        this.WINDOWS_1252 = 'windows-1252';
        this.ISO_8859_1 = 'ISO-8859-1';
        this.GB18030 = 'GB18030';
        this.SHIFT_JIS = 'SHIFT_JIS';
        this.MAC_ROMAN = 'MacRoman';
        this.GB2312 = 'GB2312';
        this.BIG5 = 'Big5';
    }

    file.prototype.Encoding = new fileEncoding();

    /**
     * Enum for name conflict resolution.
     * @enum {string}
     * @readonly
     */
    function fileNameConflictResolution() {
        this.FAIL = 'FAIL';
        this.OVERWRITE = 'OVERWRITE';
        this.OVERWRITE_CONTENT_AND_ATTRIBUTES = 'OVERWRITE_CONTENT_AND_ATTRIBUTES';
        this.RENAME_TO_UNIQUE = 'RENAME_TO_UNIQUE';
    }

    file.prototype.NameConflictResolution = new fileNameConflictResolution();

    /**
     * @exports N/file
     * @namespace file
     */
    return new file();
});