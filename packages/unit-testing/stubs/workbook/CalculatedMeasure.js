define(['./Expression'], function (Expression) {
	/**
	 * @class CalculatedMeasure
	 * @classDescription Object representing calculated measure to be used in pivot or chart
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function CalculatedMeasure() {
		/**
		 * expression for this calculated measure
		 * @name CalculatedMeasure#expression
		 * @type {Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.expression = undefined;
		/**
		 * label of the measure
		 * @name CalculatedMeasure#label
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.label = undefined;
		/**
		 * Returns the object type name (workbook.CalculatedMeasure)
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

	return new CalculatedMeasure();
});
