# Billing and invoicing

Billing results depend on installed FSM features, effective configuration, NetSuite pricing and transaction rules, permissions and background processing. The relevant subsidiary, currencies, tax setup, accounting accounts and open periods also affect transaction posting.

A Case link, Sales Order, fulfillment, Invoice and posted amount are separate outcomes. See [materials and inventory](materials-and-inventory.md) for usage, stock and fulfillment, and [financial reporting](financial-reporting.md) for posting and attribution.

## Pricing and Case transactions

NetSuite normally calculates customer pricing, which exposed price levels and billing rules can alter. Billing settings can determine Consumable billability and price level; see [Time billability and rate](time.md#manual-time-and-billability) for labour. Even nonbillable Consumables can become Sales Order lines at zero rate. The billing Customer can differ from an Asset's owner only where configured eligibility permits.

Billing Type uses `customlist_nx_billing_type`; resolve its current account values before interpreting a rule.

`custevent_nx_case_transaction` may link a Case to a quote or Estimate or Sales Order before a visit. It may also remain blank until later processing, so a blank link is not inherently an error. Quote handling can create or update an Estimate and link it to the Case. See [Mobile](mobile.md) for Quote actions and displayed totals.

## Case consumable billing

Saving a Consumable on completed Case work, or completing its CRM Task, can queue processing. A part entry or Case save alone does not establish an immediate order update. The default path groups eligible unlinked Consumables on completed Tasks by Case, so a triggered batch can include unlinked items from other Tasks on that Case.

Processing runs asynchronously in stages. Depending on the Case transaction link, it can reuse a Sales Order, request transformation of a linked quote or other eligible transaction into an order, or create a new order when the link is blank. Some transaction types do not support transformation. Verify whether the effective path replaces an existing quote link.

Linking existing orders, writing order lines, populating a blank Case link and linking processed Consumables to the order can complete separately. Configured billing and fulfillment gates apply, and known processing errors can exclude work from later batches.

Assess progress using the Case link, unlinked Consumables, order lines, processing queue, effective billing settings and errors. Check persisted body and line references against the [Asset capture path](financial-reporting.md#asset-capture-paths) before using them for reporting. A transaction link does not establish fulfillment, invoicing, payment or posted labour cost.

## Unbilled amounts and invoices

Case unbilled components represent billable expenses, unbilled Sales Order value and eligible billable Time. The Sales Order component excludes unprocessed Consumables, and expense amounts exclude tax where applicable.

FSM reads Time and Expense Report lines linked to work. Submitting an Expense Report can queue unbilled assessment without establishing that FSM created the Expense Report. Check [Time status and Invoice linkage](time.md#manual-time-and-billability) separately from refreshed Case totals.

`custevent_nx_unbilled_total` is a calculated total that is not stored. Read the available components or record value; do not overwrite rollups to repair billing. Joins can duplicate amounts, so aggregate at the underlying record or line identity.

Generate Invoice can transform an eligible Sales Order or create an Invoice while applying Time and expenses. A generic Invoice create does not reproduce that workflow. Verify orders, fulfillment, Invoice application and refreshed totals separately. A successful parent save does not prove downstream completion.
