define([], function () {
	/**
	 * @class PositionValues
	 * @classDescription Position background using horizontal and vertical values
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function PositionValues() {
		/**
		 * Horizontal setting
		 * @name PositionValues#horizontal
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_POSITION when the assigned value is outside of Position enum
		 *
		 * @since 2021.1
		 */
		this.horizontal = undefined;
		/**
		 * Vertical setting
		 * @name PositionPercent#vertical
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_POSITION when the assigned value is outside of Position enum
		 *
		 * @since 2021.1
		 */
		this.vertical = undefined;
		/**
		 * Returns the object type name (workbook.PositionValues)
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
	return new PositionValues();
});
