define(['./Section', './DataDimension'], function (Section, DataDimension) {
	/**
	 * @class DimensionSelector
	 * @classDescription Used to select a dimension in a pivot
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function DimensionSelector() {
		/**
		 * Dimension of this selector
		 * @name DimensionSelector#dimension section or data dimension
		 * @type {Section | DataDimension}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.dimension = undefined;
		/**
		 * Returns the object type name (workbook.DimensionSelector)
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
	return new DimensionSelector();
});
