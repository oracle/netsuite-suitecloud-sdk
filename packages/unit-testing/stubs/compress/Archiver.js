define([], function () {
    /**
     * Return a new instance of compress.Archiver.
     *
     * @protected
     * @class Archiver
     * @classdesc Creates file archive, such as zip or tar.
     * @constructor
     * @alias compress.Archiver
     */
    function Archiver() {

        /**
         * Add a file to be archived. Target filepath is <pre>{options.directory}/{options.file.name}</pre> or just
         * <pre>{options.file.name}</pre> (root directory) if <pre>options.directory</pre> is not specified.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {file} options.file - file to be archived
         * @param {String} [options.directory] - target directory in the archive
         *
         * @throws {SuiteScriptError} COMPRESS_API_DUPLICATE_PATH if a file has already been added on the same target path
         *
         * @since 2020.2
         */
        this.add = function (options) { };

        /**
         * Create an archive with the added files and return it as a temporary file object.
         *
         * The <pre>options.type</pre> doesn't need to be specified if the archive file name (<pre>options.name</pre>) has one
         * of the following extensions: .cpio, .tar, .tar.gz, .tar.bz2, .tgz, .tbz2, .zip.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.name - name of the archive file
         * @param {string} options.type - see archive.Type enum
         *
         * @returns {file} - temporary file object representing the archive
         *
         * @throws {SuiteScriptError} COMPRESS_API_UNSUPPORTED_ARCHIVE_TYPE if options.type is an invalid archive type
         * @throws {SuiteScriptError} COMPRESS_API_UNRECOGNIZED_ARCHIVE_FILE_EXTENSION if options.type is not specified
         *   and archive type cannot be determined from the file extension
         * @throws {SuiteScriptError} COMPRESS_API_UNABLE_TO_RETRIEVE_FILE_CONTENTS if the contents cannot be retrieved
         *   for any of the files to be archived
         *
         * @since 2020.2
         */
        this.archive = function (options) { };

        /**
         * Return the object type name (compress.Archiver).
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2020.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.2
         */
        this.toJSON = function () { };
    }

    return new Archiver();
});