define([], function () {
	/**
	 * Return a new instance of search.Setting object.
	 *
	 * @class Setting
	 * @classDescription Defines a search setting.
	 * @protected
	 * @constructor
	 *
	 * @since 2018.2
	 */

	function Setting() {
		/**
		 * The name of the search parameter.
		 * @name Setting#name
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2018.2
		 */

		this.name = undefined;
		/**
		 * The value of the search parameter.
		 * @name Setting#value
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2018.2
		 */

		this.value = undefined;
		/**
		 * Returns the object type name (search.Setting)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2018.2
		 */

		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2018.2
		 */

		this.toJSON = function () {};
	}
	return new Setting();
});
