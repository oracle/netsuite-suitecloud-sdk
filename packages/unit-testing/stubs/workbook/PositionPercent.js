define([], function () {
	/**
	 * @class PositionPercent
	 * @classDescription Position background using percentage values
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function PositionPercent() {
		/**
		 * Percent of X dimension
		 * @name PositionPercent#percentX
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.percentX = undefined;
		/**
		 * Percent of Y dimension
		 * @name PositionPercent#percentY
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.percentY = undefined;
		/**
		 * Returns the object type name (workbook.PositionPercent)
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
	return new PositionPercent();
});
