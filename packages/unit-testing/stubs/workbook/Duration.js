define([], function () {
	/**
	 * @class Duration
	 * @classDescription Simple container for currency id and amount
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function Duration() {
		/**
		 * Duration units
		 * @name Duration#units
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.units = undefined;
		/**
		 * Amount of units in this duration
		 * @name Duration#amount
		 * @type {number}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.amount = undefined;
		/**
		 * Returns the object type name (workbook.Currency)
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
	return new Duration();
});
