define([], function () {
	/**
	 * @class Expression
	 * @classDescription An expression. An expression can be used when you create a pivot definition, a data dimension item, a measure, a conditional filter, or a constant.
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function Expression() {
		/**
		 * The ID of the function used in the expression.
		 * @name Expression#functionId
		 * @type {string} Must be ExpressionType enum
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when The value for this property is not a string (workbook.ExpressionType).
		 *
		 * @since 2021.2
		 */
		this.functionId = undefined;
		/**
		 * The parameters of the expression.
		 * @name Expression#parameters
		 * @type {Object}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the value for this property is not an Object.
		 *
		 * @since 2021.2
		 */
		this.parameters = undefined;
		/**
		 * Returns the object type name (workbook.Expression)
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
	return new Expression();
});
