define([], function () {
	/**
	 * @class FieldContext
	 * @classDescription Object for specifying in which context should the field in the table view column be displayed
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function FieldContext() {
		/**
		 * Name of the context (DISPLAY, CURRENCY_CONSOLIDATED, CONVERTED ...)
		 * @name FieldContext#name
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.name = undefined;
		/**
		 * parameters of the context
		 * @name FieldContext#parameters
		 * @type {Object}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.parameters = undefined;
		/**
		 * Returns the object type name (workbook.FieldContext)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2020.2
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2020.2
		 */
		this.toJSON = function () {};
	}
	return new FieldContext();
});
