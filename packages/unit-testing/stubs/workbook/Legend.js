define(['./ChartAxis', './Section', './DataDimension', './SortDefinition'], function (ChartAxis, Section, DataDimension, SortDefinition) {
	/**
	 * @class Legend
	 * @classDescription Legend of a chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Legend() {
		/**
		 * Axes of this legend
		 * @name Legend#axes
		 * @type {Array<ChartAxis>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.axes = undefined;
		/**
		 * Section or data dimension
		 * @name Legend#root
		 * @type {Section | DataDimension}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.root = undefined;
		/**
		 * Sort definitions
		 * @name Legend#sortDefinitions
		 * @type {Array<SortDefinition>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.sortDefinitions = undefined;
		/**
		 * Returns the object type name (workbook.Legend)
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
	return new Legend();
});
