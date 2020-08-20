define(['./SearchInstance', './Column', './Filter', './Result', './Setting'], function (Search, Column, Filter, Result, Setting) {
	/**
	 * SuiteScript search common module
	 * Load the search module to create and run on-demand or saved searches and analyze and iterate through the search results.
	 *
	 * @module N/search
	 * @suiteScriptVersion 2.x
	 *
	 */

	var search = function () {};

	/**
	 * Creates a new search and returns it as a search.Search object.
	 * The search can be modified and run as an on demand search with Search.run(), without saving it. Alternatively,
	 * calling Search.save() will save the search to the database, so it can be reused later in the UI or loaded with search.load(options).
	 * @governance none
	 * @param {Object} options  the options object
	 * @param {string} options.type  The search type that you want to base the search on. Use the search.Type enum for this argument.
	 * @param {Filter|Filter[]|Object[]} [options.filters] A single search.Filter object, an array of search.Filter objects, a search filter expression, or an array of search filter expressions.
	 * @param {Object[]} [options.filterExpression] Search filter expression for the search as an array of expression objects.
	 * @param {Column|Column[]|Object[]} [options.columns] A single search.Column object or array of search.Column objects.
	 * @param {string} [options.packageId] The application ID for this search.
	 * @param {Setting|Setting[]|Object[]} [options.settings] Search settings for this search as a single search.Setting object or an array of search.Setting objects. Search settings let you specify search parameters that are typically available only in the UI. See Search.settings.
	 * @param {string} [options.title] The name for a saved search. The title property is required to save a search with Search.save().
	 * @param {string} [options.id] Script ID for a saved search. If you do not set the saved search ID, NetSuite generates one for you. See Search.id.
	 * @param {boolean} [options.isPublic] Set to true to make the search public. Otherwise, set to false. If you do not set this parameter, it defaults to false.
	 * @return {Search}
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER_EXPR The options.filters parameter is not a valid search filter, filter array, or filter expression.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN The options.columns parameter is not a valid column, string, or column or string array.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING An unknown search parameter name is provided.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING_VALUE An unsupported value is set for the provided search parameter name.
	 *
	 * @since 2015.2
	 */

	search.prototype.create = function (options) {};
	search.prototype.create.promise = function (options) {};

	/**
	 * Loads an existing saved search and returns it as a search.Search. The saved search could have been created using the UI or created with search.create(options) and Search.save().
	 * @governance 5 units
	 * @param {Object} options  the options object
	 * @param {string} options.id Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id.
	 * @param {string} [options.type] The search type of the saved search to load. Use a value from the search.Type enum for this parameter. Required if the saved search to load uses a standalone search type, optional otherwise.
	 * @return {Search}
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 * @throws {SuiteScriptError} INVALID_SEARCH Cannot find saved search with the saved search ID from options.id parameter.
	 *
	 * @since 2015.2
	 */

	search.prototype.load = function (options) {};
	search.prototype.load.promise = function (options) {};

	/**
	 * Deletes an existing saved search. The saved search could have been created using the UI or created with search.create(options) and Search.save().
	 * @governance 5 units
	 * @param {Object} options the options object
	 * @param {string} options.id Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id.
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 * @throws {SuiteScriptError} INVALID_SEARCH Cannot find saved search with the saved search ID from options.id parameter.
	 * @return {void}
	 *
	 * @since 2015.2
	 */

	search.prototype['delete'] = function (options) {};
	search.prototype['delete'].promise = function (options) {};

	/**
	 * Performs a search for duplicate records based on the account's duplicate detection configuration.
	 * @governance 10 units
	 * @param {Object} options  the options object
	 * @param {string} options.type The search type that you want to check for duplicates. Use the search.Type enum for this parameter.
	 * @param {Object} [options.fields] A set of key/value pairs used to detect duplicates. The keys are internal ID names of the fields used to detect duplicates.
	 * @param {number} [options.id] Internal ID of an existing record.
	 * @return {Result[]}
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 *
	 * @since 2015.2
	 */

	search.prototype.duplicates = function (options) {};
	search.prototype.duplicates.promise = function (options) {};

	/**
	 * Performs a global search against a single keyword or multiple keywords.
	 * @governance 10 units
	 * @param {Object} options  the options object
	 * @param {string} options.keywords Global search keywords string or expression.
	 * @return {Result[]}
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 *
	 * @since 2015.2
	 */

	search.prototype.global = function (options) {};
	search.prototype.global.promise = function (options) {};

	/**
	 * Performs a search for one or more body fields on a record.
	 * @governance 1 unit
	 * @param {Object} options  the options object
	 * @param {string} options.type The search type that you want to check for duplicates. Use the search.Type enum for this parameter.
	 * @param {string} options.id Internal ID for the record, for example 777 or 87.
	 * @param {string|string[]} options.columns Array of column/field names to look up, or a single column/field name. The columns parameter can also be set to reference joined fields.
	 * @return {Object}
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN The options.columns parameter is not a valid column, string, or column or string array.
	 *
	 * @since 2015.2
	 */

	search.prototype.lookupFields = function (options) {};
	search.prototype.lookupFields.promise = function (options) {};

	/**
	 * Creates a new search column as a search.Column object.
	 * @governance none
	 * @param {Object} options  the options object
	 * @param {string} options.name  Name of the search column.
	 * @param {string} [options.join]  Join ID for the search column.
	 * @param {string} [options.summary] Summary type for the column.
	 * @param {string} [options.formula] Formula used for the column.
	 * @param {string} [options.function] Special function for the search column.
	 * @param {string} [options.label] Label for the search column.
	 * @param {string} [options.sort] The sort order of the column.
	 * @return {Column} the created column object
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN_SUM The options.summary parameter is not a valid search summary type.
	 * @throws {SuiteScriptError} INVALID_SRCH_FUNCTN An unknown function is provided.
	 *
	 * @since 2015.2
	 */

	search.prototype.createColumn = function (options) {};

	/**
	 * Creates a new search filter as a search.Filter object.
	 * @governance none
	 * @param {Object} options  the options object
	 * @param {string} options.name  Name or internal ID of the search field.
	 * @param {string} [options.join] Join ID for the search filter.
	 * @param {string} options.operator Operator used for the search filter. Use the search.Operator enum.
	 * @param {string|Date|Number|boolean|string[]|Date[]|Number[]} [options.values] Values to be used as filter parameters.
	 * @param {string} [options.formula] Formula used for this filter
	 * @param {Summary} [options.summary] Summary type for the search filter.
	 * @return {Filter} the created filter object
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_OPERATOR Options.summary parameter is not a valid search summary type.
	 * @throws {SuiteScriptError} INVALID_SRCH_SUMMARY_TYP Options.operator parameter is not a valid operator type.
	 *
	 * @since 2015.2
	 */

	search.prototype.createFilter = function (options) {};

	/**
	 * Creates a new search setting and returns it as a search.Setting object.
	 * @governance none
	 * @param {Object} options  the options object
	 * @param {string} options.name The name of the search parameter to set
	 * @param {string} options.value The value of the search parameter.
	 * @return {Setting} the created setting object
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT A required parameter is missing.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING An unknown search parameter name is provided.
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING_VALUE An unsupported value is set for the provided search parameter name.
	 *
	 * @since 2015.2
	 */

	search.prototype.createSetting = function (options) {};

	/**
	 * Enumeration that holds the values for search operators to use with the search.Filter.
	 * @enum {string}
	 * @readonly
	 */

	function searchOperator() {
		this.AFTER = 'after';
		this.ALLOF = 'allof';
		this.ANY = 'any';
		this.ANYOF = 'anyof';
		this.BEFORE = 'before';
		this.BETWEEN = 'between';
		this.CONTAINS = 'contains';
		this.DOESNOTCONTAIN = 'doesnotcontain';
		this.DOESNOTSTARTWITH = 'doesnotstartwith';
		this.EQUALTO = 'equalto';
		this.GREATERTHAN = 'greaterthan';
		this.GREATERTHANOREQUALTO = 'greaterthanorequalto';
		this.HASKEYWORDS = 'haskeywords';
		this.IS = 'is';
		this.ISEMPTY = 'isempty';
		this.ISNOT = 'isnot';
		this.ISNOTEMPTY = 'isnotempty';
		this.LESSTHAN = 'lessthan';
		this.LESSTHANOREQUALTO = 'lessthanorequalto';
		this.NONEOF = 'noneof';
		this.NOTAFTER = 'notafter';
		this.NOTALLOF = 'notallof';
		this.NOTBEFORE = 'notbefore';
		this.NOTBETWEEN = 'notbetween';
		this.NOTEQUALTO = 'notequalto';
		this.NOTGREATERTHAN = 'notgreaterthan';
		this.NOTGREATERTHANOREQUALTO = 'notgreaterthanorequalto';
		this.NOTLESSTHAN = 'notlessthan';
		this.NOTLESSTHANOREQUALTO = 'notlessthanorequalto';
		this.NOTON = 'noton';
		this.NOTONORAFTER = 'notonorafter';
		this.NOTONORBEFORE = 'notonorbefore';
		this.NOTWITHIN = 'notwithin';
		this.ON = 'on';
		this.ONORAFTER = 'onorafter';
		this.ONORBEFORE = 'onorbefore';
		this.STARTSWITH = 'startswith';
		this.WITHIN = 'within';
	}

	search.prototype.Operator = new searchOperator();

	/**
	 * Enumeration that holds the values for summary types used by the Column.summary or Filter.summary properties.
	 * @enum {string}
	 * @readonly
	 */

	function searchSummary() {
		this.GROUP = 'GROUP';
		this.COUNT = 'COUNT';
		this.SUM = 'SUM';
		this.AVG = 'AVG';
		this.MIN = 'MIN';
		this.MAX = 'MAX';
	}

	search.prototype.Summary = new searchSummary();

	/**
	 * Enumeration that holds the values for supported sorting directions used with search.createColumn(options).
	 * @enum {string}
	 * @readonly
	 */

	function searchSort() {
		this.ASC = 'ASC';
		this.DESC = 'DESC';
		this.NONE = 'NONE';
	}

	search.prototype.Sort = new searchSort();

	function searchType() {
		this.ACCOUNT = 'account';
		this.ACCOUNTING_BOOK = 'accountingbook';
		this.ACCOUNTING_CONTEXT = 'accountingcontext';
		this.ACCOUNTING_PERIOD = 'accountingperiod';
		this.ADV_INTER_COMPANY_JOURNAL_ENTRY = 'advintercompanyjournalentry';
		this.ALLOC_RECOMMENDATION_DEMAND = 'AllocRecommendationDemand';
		this.ALLOC_RECOMMENDATION_DETAIL = 'AllocRecommendationDetail';
		this.AMORTIZATION_SCHEDULE = 'amortizationschedule';
		this.AMORTIZATION_TEMPLATE = 'amortizationtemplate';
		this.ASSEMBLY_BUILD = 'assemblybuild';
		this.ASSEMBLY_ITEM = 'assemblyitem';
		this.ASSEMBLY_UNBUILD = 'assemblyunbuild';
		this.BALANCE_TRX_BY_SEGMENTS = 'BalanceTrxBySegments';
		this.BILLING_ACCOUNT = 'billingaccount';
		this.BILLING_CLASS = 'billingclass';
		this.BILLING_RATE_CARD = 'billingratecard';
		this.BILLING_REVENUE_EVENT = 'billingrevenueevent';
		this.BILLING_SCHEDULE = 'billingschedule';
		this.BIN = 'bin';
		this.BIN_ITEM_BALANCE = 'BinItemBalance';
		this.BIN_TRANSFER = 'bintransfer';
		this.BIN_WORKSHEET = 'binworksheet';
		this.BLANKET_PURCHASE_ORDER = 'blanketpurchaseorder';
		this.BOM = 'bom';
		this.BOM_REVISION = 'bomrevision';
		this.BONUS = 'bonus';
		this.BONUS_TYPE = 'bonustype';
		this.BUDGET_EXCHANGE_RATE = 'budgetexchangerate';
		this.BULK_OWNERSHIP_TRANSFER = 'bulkownershiptransfer';
		this.BUNDLE_INSTALLATION_SCRIPT = 'bundleinstallationscript';
		this.CALENDAR_EVENT = 'calendarevent';
		this.CAMPAIGN = 'campaign';
		this.CASH_REFUND = 'cashrefund';
		this.CASH_SALE = 'cashsale';
		this.CHARGE = 'charge';
		this.CHARGE_RULE = 'chargerule';
		this.CHECK = 'check';
		this.CLASSIFICATION = 'classification';
		this.CLIENT_SCRIPT = 'clientscript';
		this.CMS_CONTENT = 'cmscontent';
		this.CMS_CONTENT_TYPE = 'cmscontenttype';
		this.CMS_PAGE = 'cmspage';
		this.COMMERCE_CATEGORY = 'commercecategory';
		this.COMMERCE_SEARCH_ACTIVITY_DATA = 'CommerceSearchActivityData';
		this.COMPETITOR = 'competitor';
		this.COM_SEARCH_BOOST = 'ComSearchBoost';
		this.COM_SEARCH_BOOST_TYPE = 'ComSearchBoostType';
		this.COM_SEARCH_ONE_WAY_SYN = 'ComSearchOneWaySyn';
		this.COM_SEARCH_GROUP_SYN = 'ComSearchGroupSyn';
		this.CONSOLIDATED_EXCHANGE_RATE = 'consolidatedexchangerate';
		this.CONTACT = 'contact';
		this.CONTACT_CATEGORY = 'contactcategory';
		this.CONTACT_ROLE = 'contactrole';
		this.COST_CATEGORY = 'costcategory';
		this.COUPON_CODE = 'couponcode';
		this.CREDIT_CARD_CHARGE = 'creditcardcharge';
		this.CREDIT_CARD_REFUND = 'creditcardrefund';
		this.CREDIT_MEMO = 'creditmemo';
		this.CURRENCY = 'currency';
		this.CURRENCY_EXCHANGE_RATE = 'CurrencyExchangeRate';
		this.CUSTOMER = 'customer';
		this.CUSTOMER_CATEGORY = 'customercategory';
		this.CUSTOMER_DEPOSIT = 'customerdeposit';
		this.CUSTOMER_MESSAGE = 'customermessage';
		this.CUSTOMER_PAYMENT = 'customerpayment';
		this.CUSTOMER_PAYMENT_AUTHORIZATION = 'customerpaymentauthorization';
		this.CUSTOMER_REFUND = 'customerrefund';
		this.CUSTOMER_STATUS = 'customerstatus';
		this.CUSTOMER_SUBSIDIARY_RELATIONSHIP = 'customersubsidiaryrelationship';
		this.CUSTOM_PURCHASE = 'custompurchase';
		this.CUSTOM_RECORD = 'customrecord';
		this.CUSTOM_SALE = 'customsale';
		this.CUSTOM_TRANSACTION = 'customtransaction';
		this.DEPARTMENT = 'department';
		this.DEPOSIT = 'deposit';
		this.DEPOSIT_APPLICATION = 'depositapplication';
		this.DESCRIPTION_ITEM = 'descriptionitem';
		this.DISCOUNT_ITEM = 'discountitem';
		this.DOWNLOAD_ITEM = 'downloaditem';
		this.EMPLOYEE = 'employee';
		this.EMPLOYEE_CHANGE_REQUEST = 'employeechangerequest';
		this.EMPLOYEE_CHANGE_REQUEST_TYPE = 'employeechangerequesttype';
		this.EMPLOYEE_PAYROLL_ITEM = 'EmployeePayrollItem';
		this.EMPLOYEE_STATUS = 'EmployeeStatus';
		this.EMPLOYEE_TYPE = 'EmployeeType';
		this.ENTITY_ACCOUNT_MAPPING = 'entityaccountmapping';
		this.ESTIMATE = 'estimate';
		this.EXPENSE_AMORT_PLAN_AND_SCHEDULE = 'ExpenseAmortPlanAndSchedule';
		this.EXPENSE_AMORTIZATION_EVENT = 'expenseamortizationevent';
		this.EXPENSE_CATEGORY = 'expensecategory';
		this.EXPENSE_PLAN = 'expenseplan';
		this.EXPENSE_REPORT = 'expensereport';
		this.FAIR_VALUE_PRICE = 'fairvalueprice';
		this.FIXED_AMOUNT_PROJECT_REVENUE_RULE = 'fixedamountprojectrevenuerule';
		this.FINANCIAL_INSTITUTION = 'financialinstitution';
		this.FOLDER = 'folder';
		this.FULFILLMENT_REQUEST = 'fulfillmentrequest';
		this.GENERIC_RESOURCE = 'genericresource';
		this.GIFT_CERTIFICATE = 'giftcertificate';
		this.GIFT_CERTIFICATE_ITEM = 'giftcertificateitem';
		this.GL_NUMBERING_SEQUENCE = 'glnumberingsequence';
		this.GLOBAL_ACCOUNT_MAPPING = 'globalaccountmapping';
		this.GLOBAL_INVENTORY_RELATIONSHIP = 'globalinventoryrelationship';
		this.GOAL = 'goal';
		this.INBOUND_SHIPMENT = 'inboundshipment';
		this.INTER_COMPANY_JOURNAL_ENTRY = 'intercompanyjournalentry';
		this.INTER_COMPANY_TRANSFER_ORDER = 'intercompanytransferorder';
		this.INVENTORY_ADJUSTMENT = 'inventoryadjustment';
		this.INVENTORY_COST_REVALUATION = 'inventorycostrevaluation';
		this.INVENTORY_COUNT = 'inventorycount';
		this.INVENTORY_DEMAND = 'InventoryDemand';
		this.INVENTORY_DETAIL = 'inventorydetail';
		this.INVENTORY_ITEM = 'inventoryitem';
		this.INVENTORY_NUMBER = 'inventorynumber';
		this.INVENTORY_NUMBER_ITEM = 'InventoryNumberItem';
		this.INVENTORY_STATUS = 'inventorystatus';
		this.INVENTORY_STATUS_LOCATION = 'InventoryStatusLocation';
		this.INVENTORY_STATUS_CHANGE = 'inventorystatuschange';
		this.INVENTORY_TRANSFER = 'inventorytransfer';
		this.INVOICE = 'invoice';
		this.INVOICE_GROUP = 'invoicegroup';
		this.INVT_NUMBER_ITEM_BALANCE = 'InvtNumberItemBalance';
		this.ISSUE = 'issue';
		this.ITEM_ACCOUNT_MAPPING = 'itemaccountmapping';
		this.ITEM_BIN_NUMBER = 'ItemBinNumber';
		this.ITEM_COLLECTION = 'itemcollection';
		this.ITEM_COLLECTION_ITEM_MAP = 'itemcollectionitemmap';
		this.ITEM_DEMAND_PLAN = 'itemdemandplan';
		this.ITEM_FULFILLMENT = 'itemfulfillment';
		this.ITEM_GROUP = 'itemgroup';
		this.ITEM_LOCATION_CONFIGURATION = 'itemlocationconfiguration';
		this.ITEM_PROCESS_FAMILY = 'itemprocessfamily';
		this.ITEM_PROCESS_GROUP = 'itemprocessgroup';
		this.ITEM_RECEIPT = 'itemreceipt';
		this.ITEM_REVISION = 'itemrevision';
		this.ITEM_SUPPLY_PLAN = 'itemsupplyplan';
		this.JOB = 'job';
		this.JOB_STATUS = 'jobstatus';
		this.JOB_TYPE = 'jobtype';
		this.JOURNAL_ENTRY = 'journalentry';
		this.KIT_ITEM = 'kititem';
		this.LABOR_BASED_PROJECT_REVENUE_RULE = 'laborbasedprojectrevenuerule';
		this.LEAD = 'lead';
		this.LOCATION = 'location';
		this.LOT_NUMBERED_ASSEMBLY_ITEM = 'lotnumberedassemblyitem';
		this.LOT_NUMBERED_INVENTORY_ITEM = 'lotnumberedinventoryitem';
		this.MANUFACTURING_COST_TEMPLATE = 'manufacturingcosttemplate';
		this.MANUFACTURING_OPERATION_TASK = 'manufacturingoperationtask';
		this.MANUFACTURING_ROUTING = 'manufacturingrouting';
		this.MAP_REDUCE_SCRIPT = 'mapreducescript';
		this.MARKUP_ITEM = 'markupitem';
		this.MASSUPDATE_SCRIPT = 'massupdatescript';
		this.MEM_DOC = 'memdoc';
		this.MERCHANDISE_HIERARCHY_LEVEL = 'merchandisehierarchylevel';
		this.MERCHANDISE_HIERARCHY_NODE = 'merchandisehierarchynode';
		this.MERCHANDISE_HIERARCHY_VERSION = 'merchandisehierarchyversion';
		this.MESSAGE = 'message';
		this.MFG_PLANNED_TIME = 'mfgplannedtime';
		this.NEXUS = 'nexus';
		this.NON_INVENTORY_ITEM = 'noninventoryitem';
		this.NOTE = 'note';
		this.NOTE_TYPE = 'notetype';
		this.OPPORTUNITY = 'opportunity';
		this.ORDER_TYPE = 'ordertype';
		this.OTHER_CHARGE_ITEM = 'otherchargeitem';
		this.OTHER_NAME = 'othername';
		this.OTHER_NAME_CATEGORY = 'othernamecategory';
		this.PARTNER = 'partner';
		this.PARTNER_CATEGORY = 'partnercategory';
		this.PAYCHECK = 'paycheck';
		this.PAYCHECK_JOURNAL = 'paycheckjournal';
		this.PAYMENT_ITEM = 'paymentitem';
		this.PAYMENT_METHOD = 'paymentmethod';
		this.PAYROLL_ITEM = 'payrollitem';
		this.PAYROLL_SETUP = 'PayrollSetup';
		this.PERFORMANCE_METRIC = 'performancemetric';
		this.PERFORMANCE_REVIEW = 'performancereview';
		this.PERFORMANCE_REVIEW_SCHEDULE = 'performancereviewschedule';
		this.PERIOD_END_JOURNAL = 'periodendjournal';
		this.PCT_COMPLETE_PROJECT_REVENUE_RULE = 'pctcompleteprojectrevenuerule';
		this.PHONE_CALL = 'phonecall';
		this.PICK_STRATEGY = 'pickstrategy';
		this.PICK_TASK = 'picktask';
		this.PORTLET = 'portlet';
		this.PRICE_BOOK = 'pricebook';
		this.PRICE_LEVEL = 'pricelevel';
		this.PRICE_PLAN = 'priceplan';
		this.PRICING_GROUP = 'pricinggroup';
		this.PROJECT_EXPENSE_TYPE = 'projectexpensetype';
		this.PROJECT_TASK = 'projecttask';
		this.PROJECT_TEMPLATE = 'projecttemplate';
		this.PROMOTION_CODE = 'promotioncode';
		this.PROSPECT = 'prospect';
		this.PURCHASE_CONTRACT = 'purchasecontract';
		this.PURCHASE_ORDER = 'purchaseorder';
		this.PURCHASE_REQUISITION = 'purchaserequisition';
		this.RESOURCE_ALLOCATION = 'resourceallocation';
		this.RES_ALLOCATION_TIME_OFF_CONFLICT = 'ResAllocationTimeOffConflict';
		this.RESTLET = 'restlet';
		this.RETURN_AUTHORIZATION = 'returnauthorization';
		this.REVENUE_ARRANGEMENT = 'revenuearrangement';
		this.REVENUE_COMMITMENT = 'revenuecommitment';
		this.REVENUE_COMMITMENT_REVERSAL = 'revenuecommitmentreversal';
		this.REVENUE_PLAN = 'revenueplan';
		this.REV_REC_PLAN_AND_SCHEDULE = 'RevRecPlanAndSchedule';
		this.REV_REC_SCHEDULE = 'revrecschedule';
		this.REV_REC_TEMPLATE = 'revrectemplate';
		this.SALES_ORDER = 'salesorder';
		this.SALES_ROLE = 'salesrole';
		this.SALES_TAX_ITEM = 'salestaxitem';
		this.SCHEDULED_SCRIPT = 'scheduledscript';
		this.SCHEDULED_SCRIPT_INSTANCE = 'scheduledscriptinstance';
		this.SCRIPT_DEPLOYMENT = 'scriptdeployment';
		this.SERIALIZED_ASSEMBLY_ITEM = 'serializedassemblyitem';
		this.SERIALIZED_INVENTORY_ITEM = 'serializedinventoryitem';
		this.SERVICE_ITEM = 'serviceitem';
		this.SHIP_ITEM = 'shipitem';
		this.SOLUTION = 'solution';
		this.STATISTICAL_JOURNAL_ENTRY = 'statisticaljournalentry';
		this.STORE_PICKUP_FULFILLMENT = 'storepickupfulfillment';
		this.SUBSCRIPTION = 'subscription';
		this.SUBSCRIPTION_CHANGE_ORDER = 'subscriptionchangeorder';
		this.SUBSCRIPTION_LINE = 'subscriptionline';
		this.SUBSCRIPTION_PLAN = 'subscriptionplan';
		this.SUBSIDIARY = 'subsidiary';
		this.SUBTOTAL_ITEM = 'subtotalitem';
		this.SUITELET = 'suitelet';
		this.SUPPLY_CHAIN_SNAPSHOT = 'supplychainsnapshot';
		this.SUPPLY_CHAIN_SNAPSHOT_DETAILS = 'SupplyChainSnapshotDetails';
		this.SUPPORT_CASE = 'supportcase';
		this.TASK = 'task';
		this.TAX_GROUP = 'taxgroup';
		this.TAX_PERIOD = 'taxperiod';
		this.TAX_TYPE = 'taxtype';
		this.TERM = 'term';
		this.TIME_APPROVAL = 'TimeApproval';
		this.TIME_BILL = 'timebill';
		this.TIME_ENTRY = 'timeentry';
		this.TIME_OFF_CHANGE = 'timeoffchange';
		this.TIME_OFF_PLAN = 'timeoffplan';
		this.TIME_OFF_REQUEST = 'timeoffrequest';
		this.TIME_OFF_RULE = 'timeoffrule';
		this.TIME_OFF_TYPE = 'timeofftype';
		this.TIME_SHEET = 'timesheet';
		this.TIMESHEET_APPROVAL = 'TimesheetApproval';
		this.TOPIC = 'topic';
		this.TRANSFER_ORDER = 'transferorder';
		this.UNITS_TYPE = 'unitstype';
		this.UNLOCKED_TIME_PERIOD = 'unlockedtimeperiod';
		this.USAGE = 'usage';
		this.USEREVENT_SCRIPT = 'usereventscript';
		this.VENDOR = 'vendor';
		this.VENDOR_BILL = 'vendorbill';
		this.VENDOR_CATEGORY = 'vendorcategory';
		this.VENDOR_CREDIT = 'vendorcredit';
		this.VENDOR_PAYMENT = 'vendorpayment';
		this.VENDOR_PREPAYMENT = 'vendorprepayment';
		this.VENDOR_PREPAYMENT_APPLICATION = 'vendorprepaymentapplication';
		this.VENDOR_RETURN_AUTHORIZATION = 'vendorreturnauthorization';
		this.VENDOR_SUBSIDIARY_RELATIONSHIP = 'vendorsubsidiaryrelationship';
		this.WAVE = 'wave';
		this.WBS = 'wbs';
		this.WEBSITE = 'website';
		this.WORKFLOW_ACTION_SCRIPT = 'workflowactionscript';
		this.WORK_ORDER = 'workorder';
		this.WORK_ORDER_CLOSE = 'workorderclose';
		this.WORK_ORDER_COMPLETION = 'workordercompletion';
		this.WORK_ORDER_ISSUE = 'workorderissue';
		this.WORKPLACE = 'workplace';
		this.ZONE = 'zone';
		this.BALANCING_RESULT = 'BalancingResult';
		this.BALANCING_TRANSACTION = 'BalancingTransaction';
		this.BALANCING_DETAIL = 'BalancingDetail';
		this.FIN_RPT_AGGREGATE_F_R = 'FinRptAggregateFR';
		this.AGGR_FIN_DAT = 'AggrFinDat';
		this.BILLING_ACCOUNT_BILL_CYCLE = 'BillingAccountBillCycle';
		this.BILLING_ACCOUNT_BILL_REQUEST = 'BillingAccountBillRequest';
		this.DELETED_RECORD = 'DeletedRecord';
		this.END_TO_END_TIME = 'EndToEndTime';
		this.GL_LINES_AUDIT_LOG = 'GlLinesAuditLog';
		this.INSTALLMENT = 'Installment';
		this.INVENTORY_BALANCE = 'InventoryBalance';
		this.INVENTORY_NUMBER_BIN = 'InventoryNumberBin';
		this.PERMISSION = 'Permission';
		this.PRICING = 'Pricing';
		this.PROJECT_IC_CHARGE_REQUEST = 'ProjectIcChargeRequest';
		this.RECENT_RECORD = 'RecentRecord';
		this.ROLE = 'Role';
		this.SAVED_SEARCH = 'SavedSearch';
		this.SHOPPING_CART = 'ShoppingCart';
		this.STATE = 'State';
		this.SUBSCRIPTION_LINE_REVISION = 'SubscriptionLineRevision';
		this.SUBSCRIPTION_RENEWAL_HISTORY = 'SubscriptionRenewalHistory';
		this.SUITE_SCRIPT_DETAIL = 'SuiteScriptDetail';
		this.S_C_M_PREDICTED_RISKS = 'SCMPredictedRisks';
		this.S_C_M_PREDICTION_TRAIN_HISTORY = 'SCMPredictionTrainHistory';
		this.SYSTEM_NOTE = 'SystemNote';
		this.TAX_DETAIL = 'TaxDetail';
		this.UBER = 'Uber';
		this.ENTITY = 'entity';
		this.ACTIVITY = 'activity';
		this.ITEM = 'item';
		this.TRANSACTION = 'transaction';
		this.PAYMENT_EVENT = 'PaymentEvent';
		this.GATEWAY_NOTIFICATION = 'GatewayNotification';
		this.PAYMENT_INSTRUMENT = 'PaymentInstrument';
		this.PAYMENT_RESULT_PREVIEW = 'PaymentResultPreview';
		this.PAYMENT_OPTION = 'PaymentOption';
		this.CARDHOLDER_AUTHENTICATION = 'CardholderAuthentication';
		this.CARDHOLDER_AUTHENTICATION_EVENT = 'CardholderAuthenticationEvent';
		this.AUTHENTICATE_DEVICE_INPUT = 'AuthenticateDeviceInput';
		this.CHALLENGE_SHOPPER_INPUT = 'ChallengeShopperInput';
	}

	search.prototype.Type = new searchType();

	/**
	 * @exports N/search
	 * @namespace search
	 */
	return new search();
});
