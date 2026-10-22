# Financial posting and reporting

Financial reporting depends on the account and reporting period. Check the effective configuration, role, transaction history and report definition. FSM field mappings and report definitions alone do not establish that values were saved, posted to the general ledger (GL), or included in a particular report. See [time](time.md) for activity and Time Bill behavior and [billing](billing.md) for Case transactions and invoices.

## Time and labour cost

Time recording, approval, cost posting and attribution of the posted amount are separate steps. A recorded Time Bill does not by itself establish a posted labour expense, even when it has hours, a cost rate and FSM references. The native Posted flag or FSM `custcol_nx_time_costed` flag can be set without a resulting GL entry. Verify the posted journal or other accounting transaction.

The optional FSM time-cost journal path requires configured debit and credit accounts. For a Project, it selects approved, uncosted Time Bills with positive stored cost and calculates the journal amount from stored cost and duration.

This routine assigns the Time Bill's CRM Task and Asset to the debit line. It does not assign those fields to the credit line or assign Case to either line. Using the path does not establish that other dimensions persist on the journal. Native Post Time, manual or custom journals, and other cost-allocation processes provide separate possible paths. Their use and coverage depend on the account.

The native project labour-accounting path requires Projects, Project Management, Job Costing and Project Budgeting, and Time Tracking. With the required project expense types and variance account, Post Time processes approved time into journals dated when posting occurs. Manually setting the native Posted flag does not create a journal.

An operational-hours report can be valid when GL attribution is unknown, but a profitability result must disclose unverified labour posting or inclusion. Missing Asset- or Case-level labour does not mean payroll expense is absent from the company P&L. A report that calculates labour from hours and rates can provide a management view without representing posted expense.

## Transaction references and report meaning

### Transaction reference fields

Without Project Management, a transaction's native `entity` can hold a Customer or Project. With Project Management, relevant transactions keep a customer-facing `entity` and map Project through `job`. FSM body Customer (`custbody_nx_customer`) is separate. A preference can add line-level Project attribution on sales transactions. The fields and synchronization used depend on transaction type, installed feature and preference.

FSM defines body and line references for Asset (`custbody_nx_asset`, `custcol_nx_asset`), CRM Task (`custbody_nx_task`, `custcol_nx_task`), Case (`custbody_nx_case`, `custcol_nx_case`), and Project Task (`custbody_nx_projecttask`, `custcol_nx_projecttask`). `custbody_nx_customer` is a body reference; Customer or Project representation on a line varies by transaction and sublist.

Shared transaction-body mapping conditionally synchronizes entity/Customer and can source body Asset from a linked CRM Task or Project Task. Overrides and conflicting relationships can change persisted values. Field enablement differs by transaction type and between body and line. Check populated transaction values in the account; [the dictionary](dictionary-guide.md) lists field definitions.

For example, the Case line field is available on journals while its body field is disabled there. Field availability does not mean Case is populated on a journal line.

### Report dimensions and Asset profitability

Case-level service-job profitability attributes amounts to a support Case representing the job. It is distinct from native NetSuite Project (`job`) profitability. Asset, CRM Task, Project Task and Customer are other possible dimensions when the relevant rows carry reliable references and the report supports them.

When a transaction covers mixed work, one body reference may not describe every line. An Asset reference may identify a Task's site or parent Asset instead of the individual Asset receiving a part or expense.

The bundled Field Service Asset Profitability Detail report is an income-statement report (`FINANCIAL_INCOME_STMT`) with a transaction-line `custcol_nx_asset` filter. The Asset profitability action selects a configured Asset report ID when present. Otherwise, it uses the account Asset report metadata fallback. It opens the report runner with the Asset name in `crit_2`.

Check the installed report, chosen report ID, child-asset rollup, labour inclusion and financial totals in the account. The Asset record has an Asset Type relationship; check whether a particular financial report supports that join.

### Transaction capture by path

Transaction paths expose different references. For operational order and fulfillment behavior, see [materials and inventory](materials-and-inventory.md) and [billing](billing.md); for capture in the technician app, see [Mobile](mobile.md).

| Transaction path | FSM mapping and fields |
| --- | --- |
| Sales Order added item lines | The `additems` path writes line CRM Task and Asset when supplied. |
| Invoice | Item-line mapping includes CRM Task. When selected, the FSM Invoice form includes body Customer, Asset, Case, CRM Task and Project Task references, plus item-line Asset, Case, CRM Task and Project Task references. |
| Item Fulfillment | Item-line mapping includes Asset and CRM Task. When selected, the FSM form includes body Customer, Asset, Case, CRM Task and Project Task references, plus item-line Asset, Case, CRM Task and Project Task references. |
| Expense Report | Expense-line mapping includes native customer, CRM Task and Asset. Default Mobile also maps Project Task line references when the relevant features are enabled and supplies body Customer, CRM Task, Project Task, Case and Asset defaults from the selected event. |

Verify persisted body and line values at each relevant stage. Mappings and form fields do not establish that values were saved, inherited through transforms, approved, posted or included in a report. Item Receipts and Item Fulfillments are different transaction types and cannot be substituted for one another in a report request.

## Asset capture paths

| Path in the default configuration | Asset reference supplied | Limit |
| --- | --- | --- |
| Mobile Time and Consumables resources | `options.asset || event.asset`; Time maps to `custcol_nx_asset`, Consumables to `custrecord_nx_consasset` | A selected child Asset reaches the resource only if the effective configuration supplies `options.asset`; otherwise the event Asset is used. |
| Case consumables billing | On a newly created Sales Order, body Asset starts from the Case Asset; added lines can receive each Consumable's Asset | Existing or transformed orders can follow a different path. Check saved lines and later transforms. |
| Direct Mobile Sales Order entry | Item-row Asset defaults to `event.asset`; body Asset is also defaulted from the event | This default does not establish the individual child Asset that consumed an item. |
| Default Mobile Expense entry | Expense-row and body Asset default to `event.asset` | Do not infer the Time or Consumables child-Asset override for Expense Reports. |

Account resource overrides can change these defaults. A parent or site body Asset and child-Asset lines can be intentional; do not overwrite one with the other merely to make them match. See [Assets](assets.md) for hierarchy and location behavior.

## Historical interpretation

FSM references can be blank on both FSM and non-FSM transactions. Even populated values may describe only the Task or site level. An account may use several capture paths at once or change configuration over time, so current configuration alone cannot explain older transactions.

Distinguish the reporting period, transaction and line scope, attribution level, labour-cost basis, and unknown or conflicting references. Do not infer a historical child Asset from today's hierarchy, Asset Type or report join.
