define(['./ConditionalFormatRule'], function (ConditionalFormatRule) {
	/**
	 * @class ConditionalFormat
	 * @classDescription Conditional format object holding conditional format rules
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function ConditionalFormat() {
		/**
		 * Formatting rules for this conditional format
		 * @name ConditionalFormat#rules
		 * @type {Array<ConditionalFormatRule>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} NO_RULE_DEFINED when the array is empty
		 *
		 * @since 2021.1
		 */
		this.rules = undefined;
		/**
		 * Returns the object type name (workbook.ConditionalFormat)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.1
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2021.1
		 */
		this.toJSON = function () {};
	}
	return new ConditionalFormat();
});
