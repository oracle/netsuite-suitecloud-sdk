define(['./ChartAxis', './Section', './DataDimension', './SortDefinition'], function (ChartAxis, Section, DataDimension, SortDefinition) {
	/**
	 * @class Category
	 * @classDescription Category of a chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Category() {
		/**
		 * Axis for this category
		 * @name Category#axis
		 * @type {ChartAxis}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.axis = undefined;
		/**
		 * Section or data dimension
		 * @name Category#root
		 * @type {Section | DataDimension}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.root = undefined;
		/**
		 * Sort definitions
		 * @name Category#sortDefinitions
		 * @type {Array<SortDefinition>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.sortDefinitions = undefined;
		/**
		 * Returns the object type name (workbook.Category)
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
	return new Category();
});
