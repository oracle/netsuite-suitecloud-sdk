define([], function () {
	/**
	 * @class Range
	 * @classDescription Range value returned from pivot execution
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function Range() {
		/**
		 * Start date/dateTime of this range (formatted according to user preferences)
		 * @name Range#start
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.start = undefined;
		/**
		 * End date/dateTime of this range (formatted according to user preferences)
		 * @name Range#end
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.end = undefined;
		/**
		 * Returns the object type name (workbook.Range)
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
	return new Range();
});
