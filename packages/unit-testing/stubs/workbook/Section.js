define(['./CalculatedMeasure', './DataMeasure', './DataDimension'], function (CalculatedMeasure, DataMeasure, DataDimension) {
	/**
	 * @class Section
	 * @classDescription Object representing section of a pivot - used for creating a hierarchy tree
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Section() {
		/**
		 * Value of total line - HIDDEN/FIRST_LINE/LAST_LINE
		 * @name Section#totalLine
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_TOTAL_LINE when the value is outside of TotalLine enum
		 *
		 * @since 2020.2
		 */
		this.totalLine = undefined;
		/**
		 * Children of this section
		 * @name Section#children
		 * @type {Array<CalculatedMeasure> | Array<DataMeasure> | Array<DataDimension> | Array<Section>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} NO_CHILDREN_DEFINED when the array is empty
		 *
		 * @since 2020.2
		 */
		this.children = undefined;
		/**
		 * Returns the object type name (workbook.Section)
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
	return new Section();
});
