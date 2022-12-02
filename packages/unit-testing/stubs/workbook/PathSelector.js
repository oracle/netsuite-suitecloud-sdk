define(['./DescendantOrSelfNodesSelector', './DimensionSelector', './ChildNodesSelector'], function (
	DescendantOrSelfNodesSelector,
	DimensionSelector,
	ChildNodesSelector
) {
	/**
	 * @class PathSelector
	 * @classDescription Used to select a portion of a pivot aither for sorting or filtering
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function PathSelector() {
		/**
		 * Elements denoting 'xpath' of this selector
		 * @name DimensionSelector#dimension section or data dimension
		 * @type {DescendantOrSelfNodesSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} NO_ELEMENTS_DEFINED when the array is empty
		 *
		 * @since 2020.2
		 */
		this.elements = undefined;
		/**
		 * Returns the object type name (workbook.PathSelector)
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
	return new PathSelector();
});
