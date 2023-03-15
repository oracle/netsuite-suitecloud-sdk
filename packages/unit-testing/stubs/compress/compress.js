
define(['./Archiver'], function (Archiver) {
    /**
     * SuiteScript compress module
     *
     * @module N/compress
     * @NApiVersion 2.x
     */
    var compress = function () { };

    /**
     * Enum for archive types.
     * @enum {string}
     * @readonly
     */
    function compressType() {
        this.CPIO = 'CPIO';
        this.TAR = 'TAR';
        this.TGZ = 'TGZ';
        this.TBZ2 = 'TBZ2';
        this.ZIP = 'ZIP';
    }

    compress.prototype.Type = new compressType();

    /**
     * Compress a file with gzip.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {File} options.file - file to be compressed
     * @param {number} [options.level] - compression level (0-9); 0 = no compression; 9 = best compression
     *
     * @return {File} - temporary file object representing the compressed file
     *
     * @throws {SuiteScriptError} COMPRESS_API_UNABLE_TO_RETRIEVE_FILE_CONTENTS if the contents of the file to be compressed
     *   cannot be retrieved
     * @throws {SuiteScriptError} COMPRESS_API_COMPRESSION_LEVEL_OUT_OF_RANGE if the level is out of range
     *
     * @since 2020.2
     */
    compress.prototype.gzip = function (options) { }

    /**
     * Decompress a gzip-compressed file.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {File} options.file - file to be decompressed
     *
     * @return {File} - temporary file object representing the decompressed file
     *
     * @throws {SuiteScriptError} COMPRESS_API_DECOMPRESS_ERROR if the file cannot be decompressed
     * @throws {SuiteScriptError} COMPRESS_API_UNABLE_TO_RETRIEVE_FILE_CONTENTS if the contents of the file to be decompressed
     *   cannot be retrieved
     *
     * @since 2020.2
     */
    compress.prototype.gunzip = function (options) { }

    /**
     * Creates a compress.Archiver object.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @return {Archiver} - The functionality for creating an archive file.
     */
    compress.prototype.createArchiver = function () { }

    /**
     * @exports N/compress
     * @namespace compress
     */
    return new compress();
});