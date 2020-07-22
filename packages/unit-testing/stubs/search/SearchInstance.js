define(['./SearchPagedData', './ResultSet'], function (SearchPagedData, ResultSet) {
	/**
	 * Return a new instance of search.Search object.
	 *
	 * @classDescription Encapsulates a NetSuite search.
	 * @constructor
	 * @param {string} typeOrJavaSearch (optional)  the record type you are searching
	 * @param {number} id  the internal ID of the search
	 * @param {Filter[]} [filters] a single filter object or an array of filters used to
	 *     filter the search
	 * @param {Column[]|string[]} [columns]  columns to be returned from the search
	 * @return {Search}
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER when provided filters contain a different type than search.Filter
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN when provided columns contain a different type than search.Column
	 *     or string
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING when provided filters contain a different type than search.Setting
	 *
	 * @since 2015.2
	 */

	function Search() {
		/**
		 * Internal ID name of the record type on which a search is based.
		 * @name Search#searchType
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.searchType = undefined;
		/**
		 * Internal ID of the search.
		 * @name Search#searchId
		 * @type {number}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.searchId = undefined;
		/**
		 * Filters for the search as an array of Filter objects.
		 * @name Search#filters
		 * @type {Filter[]}
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER Invalid value for search filter type.
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When any filter to assign is of invalid type
		 *
		 * @since 2015.2
		 */

		this.filters = undefined;
		/**
		 * Use filter expressions as a shortcut to create filters (search.Filter).
		 * @name Search#filterExpression
		 * @type {Object[]}
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER_EXPR The options.filters parameter is not a valid search filter, filter array, or filter expression.
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER Invalid value for search filter type.
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When filterExpression contains a member with invalid type
		 *
		 * @since 2015.2
		 */

		this.filterExpression = undefined;
		/**
		 * Columns to return for this search as an array of search.Column objects or a string array of column names.
		 * @name Search#columns
		 * @type {Column[]|string[]}
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN when setting value of different type than search.Column or string
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When any column to assign is of invalid type
		 *
		 * @since 2015.2
		 */

		this.columns = undefined;
		/**
		 * Search settings for this search as an array of search.Setting objects or a string array of column names.
		 * @name Search#settings
		 * @type Setting[]|string[] (setter accepts also a single search.Setting or string)
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING An unknown search parameter name is provided.
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING_VALUE An unsupported value is set for the provided search parameter name.
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When any setting to assign is of invalid type
		 *
		 * @ince 2018.2
		 */

		this.settings = undefined;
		/**
		 * Title for a saved search. Use this property to set the title for a search before you save it for the first time.
		 * @name Search#title
		 * @type {string}
		 *
		 * @since 2015.2
		 */

		this.title = undefined;
		/**
		 * Script ID for a saved search, starting with customsearch. If you do not set this property and then save the search, NetSuite generates a script ID for you.
		 * @name Search#id
		 * @type {string}
		 *
		 * @since 2015.2
		 */

		this.id = undefined;
		/**
		 * The application ID for this search.
		 * @name Search#package
		 * @type {string}
		 *
		 * @since 2019.2
		 */

		this.packageId = undefined;
		/**
		 * Value is true if the search is public, or false if it is not. By default, all searches created through search.create(options) are private.
		 * @name Search#isPublic
		 * @type {boolean}
		 *
		 * @since 2015.2
		 */

		this.isPublic = undefined;
		/**
		 * Saves a search created by search.create(options) or loaded with search.load(options). Returns the internal ID of the saved search.
		 * @governance 5 units
		 * @return {number} the internal search ID of the saved search
		 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required Search.title property not set on search.Search.
		 * @throws {SuiteScriptError} NAME_ALREADY_IN_USE The Search.title property on search.Search is not unique.
		 * @throws {SuiteScriptError} SSS_DUPLICATE_SEARCH_SCRIPT_ID The Search.id property on search.Search is not unique.
		 *
		 * @since 2015.2
		 */

		this.save = function (options) {};
		this.save.promise = function (options) {};

		/**
		 * Runs an on-demand search created with search.create(options) or a search loaded with search.load(options), returning the results as a search.ResultSet.
		 * @governance none
		 * @return {ResultSet} the result set object
		 *
		 * @since 2015.2
		 */

		this.run = function () {};

		/**
		 * Runs the current search and returns summary information about paginated results. Calling this method does not give you the result set or save the search.
		 * @governance none
		 * @return {SearchPagedData} PagedData object that allows user to page through the search result
		 *
		 * @since 2016.1
		 */

		this.runPaged = function (options) {};
		this.runPaged.promise = function (options) {};

		/**
		 * Returns the object type name (search.Search)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2015.2
		 */

		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2015.2
		 */

		this.toJSON = function () {};
	}
	return new Search();
});
