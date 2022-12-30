define(['./Expression'], function (Expression) {
	/**
	 * @class ChartAxis
	 * @classDescription Axis of a chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function ChartAxis() {
		/**
		 * Title of the axis
		 * @name ChartAxis#title
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.title = undefined;
		/**
		 * Returns the object type name (workbook.ChartAxis)
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
	return new ChartAxis();
});
