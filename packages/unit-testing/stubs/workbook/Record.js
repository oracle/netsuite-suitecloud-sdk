define([], function () {
	/**
	 * @class Record
	 * @classDescription Record returned from pivot execution
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function Record() {
		/**
		 * Primary key of this record
		 * @name Record#primaryKey
		 * @type {number}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.primaryKey = undefined;
		/**
		 * Properties of this record
		 * @name Record#properties
		 * @type {Object}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.properties = undefined;
		/**
		 * Name of the record type
		 * @name Record#name
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.name = undefined;
		/**
		 * Returns the object type name (workbook.Record)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.2
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2021.2
		 */
		this.toJSON = function () {};
	}
	return new Record();
});
