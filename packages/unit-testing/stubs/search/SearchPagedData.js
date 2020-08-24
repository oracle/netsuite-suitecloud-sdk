define(['./SearchPageRange'], function (SearchPageRange) {
	/**
	 * @class SearchPagedData
	 * @classdesc Holds metadata for a paginated query.
	 * @protected
	 * @constructor
	 *
	 * @since 2015.2
	 */

	function SearchPagedData() {
		/**
		 * Maximum number of entries per page. Possible values are 5 - 1000 entries per page.
		 * @type {number}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.pageSize = undefined;
		/**
		 * The total number of results when Search.runPaged(options) was executed.
		 * @type {number}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 */

		this.count = undefined;
		/**
		 * The collection of SearchPageRange objects that divide the entire result set into smaller groups.
		 * @type {SearchPageRange[]}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.pageRanges = undefined;
	}
	return new SearchPagedData();
});
