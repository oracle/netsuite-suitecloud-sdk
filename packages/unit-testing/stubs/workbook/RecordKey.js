define([], function () {
	/**
	 * @class RecordKey
	 * @classDescription RecordKey can either be returned from pivot execution or created as an input to constant expression
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function RecordKey() {
		/**
		 * Properties of the record key
		 * @name RecordKey#properties
		 * @type {Object}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.properties = undefined;
		/**
		 * Returns the object type name (workbook.RecordKey)
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
	return new RecordKey();
});
