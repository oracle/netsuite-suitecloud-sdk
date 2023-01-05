define(['./DataDimension', './Section', './SortDefinition'], function (DataDimension, Section, SortDefinition) {
	/**
	 * @class Pivot axis
	 * @classDescription Pivot axis holds root dimension a its sorts
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function PivotAxis() {
		/**
		 * Root data definition
		 * @name PivotAxis#root
		 * @type {DataDimension | Section}
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
		 * Returns the object type name (workbook.PivotAxis)
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
	return new PivotAxis();
});
