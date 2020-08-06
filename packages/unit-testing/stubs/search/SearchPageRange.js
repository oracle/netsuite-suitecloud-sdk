define([], function () {
	/**
	 * @class SearchPageRange
	 * @classDescription Defines the page range to contain the result set
	 * @protected
	 * @constructor
	 *
	 * @since 2015.2
	 */

	function SearchPageRange() {
		/**
		 * @governance none
		 * @return {number}
		 *
		 * @since 2015.2
		 */

		this.getIndex = function () {};

		/**
		 * @governance none
		 * @return {string}
		 *
		 * @since 2015.2
		 */

		this.getCompoundKey = function () {};

		/**
		 * @governance none
		 * @return {string}
		 *
		 * @since 2015.2
		 */

		this.getCompoundLabel = function () {};
	}
	return new SearchPageRange();
});
