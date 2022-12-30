define(['./Section'], function (Section) {
	/**
	 * @class SectionValue
	 * @classDescription Value of the section from pivot intersection
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function SectionValue() {
		/**
		 * Section
		 * @name SectionValue#section
		 * @type {Section}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.section = undefined;
		/**
		 * Returns the object type name (workbook.SectionValue)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.2
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2021.2
		 */
		this.toJSON = function () {};
	}
	return new SectionValue();
});
