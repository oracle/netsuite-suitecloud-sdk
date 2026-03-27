# NetSuite Permission Index

Human-readable lookup guide for all NetSuite permission IDs. Use it alongside `permissions.json` for validation and `SKILL.md` for usage rules.

---

## Part A: By Category

### ADMI_ — Administration (203 unique IDs)

Setup, customization, and system-level permissions. These control who can configure NetSuite itself.

**Common examples:**

| ID | Display Name |
|----|-------------|
| `ADMI_CUSTOMSCRIPT` | SuiteScript |
| `ADMI_CUSTRECORD` | Custom Record Types |
| `ADMI_CUSTFIELD` | Custom Fields |
| `ADMI_WORKFLOW` | Workflow |
| `ADMI_BUNDLER` | SuiteBundler |
| `ADMI_RESTWEBSERVICES` | REST Web Services |
| `ADMI_WEBSERVICES` | SOAP Web Services |
| `ADMI_INTEGRAPP` | Integration Application |
| `ADMI_MANAGEUSERS` | Manage Users |
| `ADMI_MANAGEROLES` | Bulk Manage Roles |
| `ADMI_ENABLEFEATURES` | Enable Features |
| `ADMI_COMPANY` | Company Information |
| `ADMI_KEYS` | Key Management |
| `ADMI_LOGIN_OAUTH` | Log In Using Access Tokens |
| `ADMI_LOGIN_OAUTH2` | Log In Using OAuth 2.0 Access Tokens |
| `ADMI_MANAGE_OAUTH_TOKENS` | Access Token Management |
| `ADMI_SAMLSSO` | SAML Single Sign-on |
| `ADMI_HTMLFORMULA` | Create HTML Formulas in Search |
| `ADMI_IMPORTCSVFILE` | Import CSV File |
| `ADMI_ADVANCED_TEMPLATES` | Advanced PDF/HTML Templates |

---

### LIST_ — Lists/Records (224 unique IDs)

Entity and record permissions. These control access to master data records like customers, items, employees, and documents.

**Common examples:**

| ID | Display Name |
|----|-------------|
| `LIST_CUSTJOB` | Customers |
| `LIST_VENDOR` | Vendors |
| `LIST_EMPLOYEE` | Employees |
| `LIST_ITEM` | Items |
| `LIST_ACCOUNT` | Accounts |
| `LIST_CONTACT` | Contacts |
| `LIST_PARTNER` | Partners |
| `LIST_LOCATION` | Locations |
| `LIST_DEPARTMENT` | Departments |
| `LIST_CLASS` | Classes |
| `LIST_SUBSIDIARY` | Subsidiaries |
| `LIST_FILECABINET` | Documents and Files |
| `LIST_FIND` | Perform Search |
| `LIST_CASE` | Cases |
| `LIST_CAMPAIGN` | Marketing Campaigns |
| `LIST_PAYCHECK` | Paychecks |
| `LIST_BOM` | Bill of Materials |
| `LIST_INBOUNDSHIPMENT` | Inbound Shipment |
| `LIST_REVENUEELEMENT` | Revenue Element |
| `LIST_CURRENCY` | Currency |

---

### REGT_ — Registers (21 unique IDs)

Account register view permissions. These control who can access accounting register screens.

**All entries:**

| ID | Display Name |
|----|-------------|
| `REGT_ACCTPAY` | Accounts Payable Register |
| `REGT_ACCTREC` | Accounts Receivable Register |
| `REGT_BANK` | Bank Account Registers |
| `REGT_COGS` | Cost of Goods Sold Registers |
| `REGT_CREDCARD` | Credit Card Registers |
| `REGT_DEFEREXPENSE` | Deferred Expense Registers |
| `REGT_DEFERREVENUE` | Deferred Revenue Registers |
| `REGT_EQUITY` | Equity Registers |
| `REGT_EXPENSE` | Expense Registers |
| `REGT_FIXEDASSET` | Fixed Asset Registers |
| `REGT_INCOME` | Income Registers |
| `REGT_LONGTERMLIAB` | Long-Term Liability Registers |
| `REGT_NONPOSTING` | Non-Posting Registers |
| `REGT_OTHASSET` | Other Asset Registers |
| `REGT_OTHCURRASSET` | Other Current Asset Registers |
| `REGT_OTHCURRLIAB` | Other Current Liability Registers |
| `REGT_OTHEXPENSE` | Other Expense Registers |
| `REGT_OTHINCOME` | Other Income Registers |
| `REGT_PAYROLL` | Run Payroll |
| `REGT_STAT` | Statistical Account Registers |
| `REGT_UNBILLEDREC` | Unbilled Receivable Registers |

---

### REPO_ — Reports (66 unique IDs)

Report access permissions. These control which financial, operational, and analytical reports a role can run.

**Common examples:**

| ID | Display Name |
|----|-------------|
| `REPO_FINANCIALS` | Financial Statements |
| `REPO_GL` | General Ledger |
| `REPO_AR` | Accounts Receivable |
| `REPO_AP` | Accounts Payable |
| `REPO_BALANCESHEET` | Balance Sheet |
| `REPO_PANDL` | Income Statement |
| `REPO_CASHFLOW` | Cash Flow Statement |
| `REPO_TRIALBALANCE` | Trial Balance |
| `REPO_SALES` | Sales |
| `REPO_INVENTORY` | Inventory |
| `REPO_ANALYTICS` | SuiteAnalytics Workbook |
| `REPO_PAYROLL` | Payroll Summary and Detail Reports |
| `REPO_TIME` | Time Tracking |
| `REPO_TRAN` | Transaction Detail |
| `REPO_BUDGET` | Budget |
| `REPO_REVREC` | Revenue Recognition Reports |
| `REPO_PURCHASES` | Purchases |
| `REPO_BOOKINGS` | Sales Order Reports |
| `REPO_SALESORDER` | Sales Order Fulfillment Reports |
| `REPO_CUSTOMIZATION` | Report Customization |

---

### TRAN_ — Transactions (159 unique IDs)

Transaction creation and management permissions. These control which transaction types a role can create, view, edit, or approve.

**Common examples:**

| ID | Display Name |
|----|-------------|
| `TRAN_SALESORD` | Sales Order |
| `TRAN_CUSTINVC` | Invoice |
| `TRAN_PURCHORD` | Purchase Order |
| `TRAN_VENDBILL` | Bills |
| `TRAN_JOURNAL` | Make Journal Entry |
| `TRAN_ITEMSHIP` | Item Fulfillment |
| `TRAN_ITEMRCPT` | Item Receipt |
| `TRAN_INVADJST` | Adjust Inventory |
| `TRAN_CUSTPYMT` | Customer Payment |
| `TRAN_VENDPYMT` | Pay Bills |
| `TRAN_RTNAUTH` | Return Authorization |
| `TRAN_TRNFRORD` | Transfer Order |
| `TRAN_WORKORD` | Work Order |
| `TRAN_EXPREPT` | Expense Report |
| `TRAN_TIMEBILL` | Track Time |
| `TRAN_ESTIMATE` | Estimate |
| `TRAN_OPPRTNTY` | Opportunity |
| `TRAN_CUSTCRED` | Credit Memo |
| `TRAN_CASHSALE` | Cash Sale |
| `TRAN_PURCHREQ` | Requisition |

---

## Part B: By Use Case

Minimum required permissions for common SuiteScript and integration scenarios. Grant only what the use case requires.

| Use Case | Required Permissions | Min Level | Notes |
|----------|---------------------|-----------|-------|
| Read a sales order | `TRAN_SALESORD` | VIEW | Add `LIST_CUSTJOB` if accessing customer fields |
| Create a sales order | `TRAN_SALESORD`, `LIST_CUSTJOB`, `LIST_ITEM` | CREATE | |
| Update sales order fields | `TRAN_SALESORD` | EDIT | |
| Create an invoice | `TRAN_CUSTINVC`, `TRAN_SALESORD` | CREATE | SO needed to invoice it |
| Apply customer payment | `TRAN_CUSTPYMT`, `TRAN_CUSTINVC`, `LIST_CUSTJOB` | EDIT | |
| Create purchase order | `TRAN_PURCHORD`, `LIST_VENDOR`, `LIST_ITEM` | CREATE | |
| Receive against PO | `TRAN_ITEMRCPT`, `TRAN_PURCHORD` | CREATE | |
| Enter vendor bill | `TRAN_VENDBILL`, `TRAN_PURCHORD`, `LIST_VENDOR` | CREATE | |
| Pay vendor bill | `TRAN_VENDPYMT`, `TRAN_VENDBILL`, `LIST_VENDOR` | CREATE | |
| Process expense report | `TRAN_EXPREPT`, `LIST_EMPLOYEE` | EDIT | |
| Adjust inventory | `TRAN_INVADJST`, `LIST_ITEM` | EDIT | |
| Transfer inventory | `TRAN_INVTRNFR`, `LIST_ITEM`, `LIST_LOCATION` | EDIT | |
| Fulfill sales orders | `TRAN_ITEMSHIP`, `TRAN_SALESORD` | EDIT | |
| Process return authorization | `TRAN_RTNAUTH`, `TRAN_SALESORD`, `LIST_CUSTJOB` | EDIT | |
| Make journal entry | `TRAN_JOURNAL`, `LIST_ACCOUNT` | CREATE | |
| Track time | `TRAN_TIMEBILL`, `LIST_EMPLOYEE` | CREATE | |
| Manage employees | `LIST_EMPLOYEE` | EDIT | Add `LIST_EMPLOYEE_CONFIDENTIAL` for sensitive fields |
| Search customer records | `LIST_CUSTJOB`, `LIST_FIND` | VIEW | |
| Search items | `LIST_ITEM`, `LIST_FIND` | VIEW | |
| Work order processing | `TRAN_WORKORD`, `TRAN_WOISSUE`, `TRAN_WOCOMPL`, `LIST_ITEM` | EDIT | |
| Run reports | `REPO_FINANCIALS` or specific REPO_* | VIEW | Grant per report category needed |
| View account registers | `REGT_BANK` or specific REGT_* | VIEW | Grant per register type needed |
| REST API integration role | `ADMI_RESTWEBSERVICES` + record-level permissions | VIEW/EDIT | Always pair with least-privilege record perms |
| Token-based authentication | `ADMI_LOGIN_OAUTH` or `ADMI_LOGIN_OAUTH2` | — | Required in addition to record permissions |
| SuiteScript deployment (admin) | `ADMI_CUSTOMSCRIPT` | FULL | Only for roles that deploy scripts |
| Custom record CRUD | `customrecord_xyz` | FULL/EDIT/VIEW | Validate script ID against project XML |
| File cabinet access | `LIST_FILECABINET` | VIEW or CREATE | CREATE needed to upload files |
| Saved search creation | `LIST_FIND`, `LIST_PUBLISHSEARCH` | VIEW + FULL | PUBLISHSEARCH for sharing searches |

---

## Part C: By Functional Module

Permissions grouped by business function, useful when designing roles for specific departments or integrations.

### Sales & CRM
- `TRAN_SALESORD` — Sales Order
- `TRAN_SALESORDAPPRV` — Sales Order Approval
- `TRAN_ESTIMATE` — Estimate
- `TRAN_OPPRTNTY` — Opportunity
- `LIST_CUSTJOB` — Customers
- `LIST_CONTACT` — Contacts
- `LIST_CAMPAIGN` — Marketing Campaigns
- `LIST_CASE` — Cases
- `TRAN_SALESORDFULFILL` — Fulfill Orders

### Purchasing & Vendors
- `TRAN_PURCHORD` — Purchase Order
- `TRAN_PURCHORDRECEIVE` — Receive Order
- `TRAN_VENDBILL` — Bills
- `TRAN_VENDPYMT` — Pay Bills
- `TRAN_PURCHREQ` — Requisition
- `TRAN_BLANKORD` — Blanket Purchase Order
- `LIST_VENDOR` — Vendors
- `TRAN_ITEMRCPT` — Item Receipt

### Inventory & Warehouse
- `TRAN_INVADJST` — Adjust Inventory
- `TRAN_INVTRNFR` — Transfer Inventory
- `TRAN_INVCOUNT` — Count Inventory
- `TRAN_ITEMSHIP` — Item Fulfillment
- `TRAN_ITEMRCPT` — Item Receipt
- `TRAN_TRNFRORD` — Transfer Order
- `LIST_ITEM` — Items
- `LIST_LOCATION` — Locations
- `LIST_BIN` — Bins
- `LIST_INBOUNDSHIPMENT` — Inbound Shipment

### Manufacturing
- `TRAN_WORKORD` — Work Order
- `TRAN_WOISSUE` — Work Order Issue
- `TRAN_WOCOMPL` — Work Order Completion
- `TRAN_WOCLOSE` — Work Order Close
- `TRAN_BUILD` — Build Assemblies
- `TRAN_UNBUILD` — Unbuild Assemblies
- `LIST_BOM` — Bill of Materials
- `LIST_MFGROUTING` — Manufacturing Routing
- `LIST_MATERIALREQUIREMENTSPLAN` — Material Requirements Planning

### Finance & Accounting
- `TRAN_JOURNAL` — Make Journal Entry
- `TRAN_CUSTINVC` — Invoice
- `TRAN_CUSTPYMT` — Customer Payment
- `TRAN_CUSTCRED` — Credit Memo
- `TRAN_VENDBILL` — Bills
- `TRAN_VENDPYMT` — Pay Bills
- `TRAN_DEPOSIT` — Deposit
- `TRAN_RECONCILE` — Reconcile
- `LIST_ACCOUNT` — Accounts
- `REGT_ACCTPAY` — Accounts Payable Register
- `REGT_ACCTREC` — Accounts Receivable Register
- `REGT_BANK` — Bank Account Registers
- `REPO_FINANCIALS` — Financial Statements
- `REPO_GL` — General Ledger
- `REPO_BALANCESHEET` — Balance Sheet
- `REPO_PANDL` — Income Statement

### HR & Payroll
- `LIST_EMPLOYEE` — Employees
- `LIST_EMPLOYEE_CONFIDENTIAL` — Employee Confidential
- `LIST_PAYCHECK` — Paychecks
- `TRAN_EXPREPT` — Expense Report
- `TRAN_TIMEBILL` — Track Time
- `TRAN_MANAGEPAYROLL` — Manage Payroll
- `TRAN_PAYROLLRUN` — Process Payroll
- `REGT_PAYROLL` — Run Payroll
- `REPO_PAYROLL` — Payroll Summary and Detail Reports

### Support / Cases
- `LIST_CASE` — Cases
- `LIST_ISSUE` — Issues
- `LIST_KNOWLEDGEBASE` — Knowledge Base
- `ADMI_CASEALERT` — Case Alerts
- `ADMI_SUPPORTSETUP` — Support Setup
- `REPO_SUPPORT` — Support

### E-Commerce / Website
- `ADMI_SITEMANAGEMENT` — Website Management
- `ADMI_STORESETUP` — Set Up Website
- `LIST_STORECATEGORY` — Store Categories
- `LIST_INFOCATEGORY` — Store Content Categories
- `LIST_INFOITEM` — Store Content Items
- `REPO_WEBSITE` — Website Report
- `REPO_WEBSTORE` — Web Store Report

### Custom Records
Custom record permissions use the record's SDF script ID as the `permkey`. These do not appear in `permissions.json`.

Format: `customrecord_<scriptid>`

Example XML:
```xml
<permission>
  <permkey>customrecord_my_integration_log</permkey>
  <permlevel>EDIT</permlevel>
</permission>
```

Validate the script ID against your project's `Objects/` directory — the `.xml` file for the custom record type.

---

## Part D: Most Common Permissions in SDF Projects

The 20 most frequently needed permissions when building SuiteScript, integrations, and custom roles:

| Rank | ID | Display Name | Why It's Common |
|------|----|-------------|-----------------|
| 1 | `TRAN_SALESORD` | Sales Order | Core transaction in almost every commerce project |
| 2 | `LIST_CUSTJOB` | Customers | Required for any customer-facing script or search |
| 3 | `LIST_ITEM` | Items | Required for any script touching inventory or orders |
| 4 | `TRAN_CUSTINVC` | Invoice | Billing and A/R workflows |
| 5 | `TRAN_PURCHORD` | Purchase Order | Procurement and receiving workflows |
| 6 | `LIST_VENDOR` | Vendors | Purchasing, payments, vendor integrations |
| 7 | `TRAN_VENDBILL` | Bills | AP processing |
| 8 | `TRAN_JOURNAL` | Make Journal Entry | Accounting automations, GL integrations |
| 9 | `LIST_EMPLOYEE` | Employees | HR scripts, time tracking, expense workflows |
| 10 | `TRAN_ITEMSHIP` | Item Fulfillment | Order fulfillment automations |
| 11 | `LIST_ACCOUNT` | Accounts | Financial scripts requiring account lookups |
| 12 | `TRAN_INVADJST` | Adjust Inventory | Inventory management scripts |
| 13 | `LIST_FIND` | Perform Search | Any role that needs to run saved searches |
| 14 | `LIST_FILECABINET` | Documents and Files | File upload/download, PDF generation |
| 15 | `ADMI_CUSTOMSCRIPT` | SuiteScript | Roles that deploy or manage scripts |
| 16 | `ADMI_RESTWEBSERVICES` | REST Web Services | REST integration roles |
| 17 | `ADMI_LOGIN_OAUTH` | Log In Using Access Tokens | TBA-authenticated integrations |
| 18 | `TRAN_EXPREPT` | Expense Report | HR and finance automation |
| 19 | `TRAN_TIMEBILL` | Track Time | Time tracking and project billing |
| 20 | `LIST_LOCATION` | Locations | Multi-location inventory and fulfillment scripts |
