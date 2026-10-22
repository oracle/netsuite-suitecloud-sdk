# Timebill field guide

Generated from saved SuitePeople `timebill` REST/SuiteQL metadata and the `job.jobItem` Billing Item field evidence. This is field discovery evidence, **not** a create contract or active-form policy. Refresh metadata in the selected account and role at runtime. No saved required-field list is present; create writability, active-form requiredness, and field-specific option eligibility remain unknown until independently evidenced.

## Fields that shape a new Actual Time entry

| Field | REST exposure / type | SuiteQL label and account description |
| --- | --- | --- |
| `employee` | Exposed; object | Employee: Select the employee whose time you are recording. Click New to set up a new employee record. For Timesheets, click the Quick Find icon at the top of the page to select a different timesheet. |
| `tranDate` | Exposed; string | Date: NetSuite inserts today's date as the date of this transaction. You can type or pick another date. |
| `hours` | Exposed; string | Duration: If you filled in the Start Time, End Time and Break fields, NetSuite automatically fills in the Duration field for you. If you didn't fill in these fields, enter the total time worked in hours and minutes. If you want to time yourself as you work, click the Timer link next to the Duration field. |
| `timeType` | Exposed; object | Type: The type of time transaction is displayed here. Actual time is time that has been worked by an employee. Planned time is time that has been accounted for when planning a project. Allocated time is time that has been assigned due to a resource allocation. |
| `customer` | Exposed; object | Customer:Project: If applicable, select the customer or project that applies to this time transaction. If you select a customer or project, you must also select a service item. Click -New- to set up a new customer. |
| `item` | Exposed; object | Service Item: If applicable, select the service that was provided. If you select a service item, you must also select a customer or project. Click New to set up a new service item. |
| `caseTaskEvent` | Exposed; object | Task: Select a case, task, event or call for the customer or project you selected, to associate this time with an activity. This time entry is added to the record you select. |
| `isBillable` | Exposed; boolean | Billable: Check this box if the time you are entering can be billed. |
| `memo` | Exposed; string | Memo: If you want, enter a memo for this time transaction. If you are billing this time back to a customer or job, this memo appears as a description for this line item on the customer invoice. |
| `subsidiary` | Exposed; object | Subsidiary: The subsidiary associated with the employee is displayed here. |
| `department` | Exposed; object | Department: If you want, select the department that applies to this transaction. Click New to set up a new department. |
| `class` | Exposed; object | Class: If you want, select the class that applies to this transaction. Click New to set up a new class. |
| `location` | Exposed; object | Location: Select a location to associate with this transaction. Select New to create a new location record. |
| `billingClass` | Exposed; object | Billing Class: Select a billing class for this time entry. If a billing class is selected for this employee it is automatically selected. |
| `timesheet` | Exposed; object | Timesheet: Returns the employee and the time period of the timesheet. The returned information is a link to the employee's specific timesheet record. |
| `payrollItem` | Exposed; object | Payroll Item: Select the payroll item that applies to this time entry. Selecting the correct payroll item ensures that the correct rate is applied. |
| `payrollWorkplace` | Exposed; object | Payroll Item Workplace: Select the payroll item location for this time entry. The selection in this field helps determine payroll tax implications. |
| `price` | Exposed; object | Price Level: If you've set up a custom price level for your customer, it appears here. Otherwise, Sales Price 1 on the service item's record appears. If you want to change the price level, select one from the list. Select Custom to enter a new price in the Rate field. If you're entering time for a payroll item like vacation time, leave this field blank. If you're entering time for a charge-based project and there are time-based charge rules, any price level selected in this field will be overridden by the applied charge rule. |
| `rate` | Exposed; number | Rate: If you selected a price in the Price Level field, it automatically appears here. If you don't use multiple prices or if you selected Custom in the Price Level field, enter a rate for this time transaction. If you're entering time for a payroll item like vacation time, leave this field blank. If you're entering time for a charge-based project and there are time-based charge rules, any rate entered in this field will be overridden by the applied charge rule. |
| `overrideRate` | Exposed; boolean | Lock this Rate: If you're billing this time back to a customer, check this box to lock the rate you enter so it's not affected by rate changes that happen before the customer is billed. If you're entering time for a charge-based project and there are time-based charge rules, the rate is determined by the applied charge rule. Any rates entered on time records are discarded. If you are entering time for a payroll item like vacation time, leave this field blank. |
| `hoursstart` | Absent | Start Time: Enter the time when work started, in hours and minutes, in the format h:mm, followed by am or pm. |
| `hoursend` | Absent | End time: Enter the time when work ended, in hours and minutes, in the format h:mm, followed by am or pm. |
| `approvalStatus` | Exposed; object | Approval Status: Select an approval status for this time entry. |

## Conditional rules to apply with live evidence

- **Employee and subsidiary:** Set the validated target employee explicitly. The SuiteQL description says Subsidiary is associated with the employee. Validate the target subsidiary before searching Location and other subsidiary-scoped references; do not substitute a different employee or subsidiary.
- **Customer/project and Service Item:** The SuiteQL Customer description says selecting a customer/project also requires a service item. The Item description says selecting a service item also requires a customer/project. A missing or ambiguous dependent value keeps the row Needs clarification. Requery Service Item candidates after Customer changes.
- **Project Billing Item preference:** Preserve an explicit user/draft Service Item. Otherwise, for a selected project inspect its current `job.jobItem` Billing Item first. Saved SuiteQL description: “Enter the service item to appear on transactions billed to the customer.” REST metadata exposes reference `id` and `refName`. Propose a present project Billing Item by exact ID/name, but treat it as a candidate for `timebill.item` until field eligibility can be verified. Do not assume it is automatically valid or silently replace an explicit item.
- **Service Item fallback and denied lookup:** If no usable project Billing Item exists, discover possible Service Items through live permitted, bounded metadata/search/selector paths. SuitePeople `item` and `serviceitem` SuiteQL metadata returned 404, and a prior Items saved search was denied; do not hard-code either SuiteQL type. On lookup denial, ask for the internal ID **if the user knows it**. Without an exact ID the row stays Needs clarification; a supplied but unreadable ID is shown as `Service Item ID <id> (unverified)` in draft and final review without inventing or requiring a label, with possible NetSuite rejection disclosed.
- **Activity and memo:** Case/Task/Event must be a valid related activity for the selected customer/project. Only populate a memo that describes confirmed work, after a valid activity or Service Item is selected.
- **Billable:** Use an explicit user choice or supported customer/project/item rule. Do not infer billability from a meeting title. Show unknown rather than inventing a boolean.
- **Location and classifications:** Department and Class are described as optional in the generic SuiteQL text, but an active form or customization can require them. Location is schema-exposed; its requiredness and create writability are unknown in this snapshot. Find active Location candidates for the target employee's exact subsidiary and keep them candidate until field options verify eligibility. Billing Class may default from the employee; validate a default before using it.
- **Payroll and pricing:** Payroll Item and Payroll Workplace apply only in enabled account contexts. Price Level and Rate are conditional; the descriptions say customer pricing or charge rules can override them, and payroll time can leave them blank. Lock this Rate is conditional on customer billing and may be discarded for charge-based projects. Do not send these fields merely because metadata exposes them.
- **Timesheet and approval:** Associate an existing open Weekly Timesheet only if the live create contract supports or requires it. Never create or submit a parent timesheet. Do not set Approval Status, Next Approver, or Supervisor Approval; read NetSuite's assigned state after creation.
- **Unknown requiredness:** The snapshots do not contain active-form mandatory rules. Exposed or nullable does not mean optional or writable. A verified required field that cannot be sent blocks Save; an unknown form requirement is disclosed in the final review and NetSuite may reject a separately authorized create.

## Complete snapshot inventory

These are metadata keys only. The list includes read-only, system, and conditional fields and must not be copied wholesale into a create payload.

| Field | REST type | SuiteQL type |
| --- | --- | --- |
| `approvalStatus` | object | object |
| `billed` | — | boolean |
| `billingClass` | object | object |
| `caseTaskEvent` | object | object |
| `chargebillingrunid` | — | integer |
| `class` | object | object |
| `closed` | — | string |
| `createdDate` | string | string |
| `custcol_created_by_wfm` | boolean | boolean |
| `customForm` | object | — |
| `customer` | object | object |
| `department` | object | object |
| `displayField` | string | string |
| `employee` | object | object |
| `externalId` | string | string |
| `hours` | string | string |
| `hoursend` | — | string |
| `hoursstart` | — | string |
| `id` | string | integer |
| `isBillable` | boolean | boolean |
| `isExempt` | boolean | boolean |
| `isProductive` | boolean | boolean |
| `isUtilized` | boolean | boolean |
| `item` | object | object |
| `journal` | — | object |
| `laborCost` | — | integer |
| `laborCostCurrency` | — | object |
| `lastModifiedDate` | string | string |
| `location` | object | object |
| `memo` | string | string |
| `overrideRate` | boolean | boolean |
| `paidExternally` | boolean | boolean |
| `payrollItem` | object | object |
| `payrollWorkplace` | object | object |
| `posted` | boolean | boolean |
| `price` | object | object |
| `rate` | number | integer |
| `refName` | string | — |
| `rejectionNote` | string | string |
| `resourceAllocation` | object | object |
| `status` | — | string |
| `subsidiary` | object | object |
| `timeModified` | boolean | boolean |
| `timeOffType` | object | object |
| `timeType` | object | object |
| `timesheet` | object | object |
| `tranDate` | string | string |

## Denial scope and create readiness

An unavailable lookup or label is distinct from denial of the underlying reference, population or create operation. An administrator-supplied ID does not override a denial. Resolve unclear denial scope before the dependent action. The supported create interface and writable payload fields must be established before Save; unknown active-form requiredness may remain explicitly disclosed only when the supported create contract permits that payload. Never create to test permissions or discover writability.
