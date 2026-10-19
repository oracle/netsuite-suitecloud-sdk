Before tool use, load and apply [category SafeWords](../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Asset history, completion, time and materials

Distinguish recorded service work from its downstream effects using the product references in each procedure.

## Find Asset service history

Resolve `customrecord_nx_asset` by ID, or by name or serial with customer and location context. Names and serials can collide. Read its identity, primary customer, parent and children, item, and any requested location and timezone fields.

Query completed CRM-task history through the Asset relationship. Query Project Task history separately when enabled. Before including install, maintenance, repair, uninstall or safety result records, check that they are available in the account and that the requested joins are supported.

History extends beyond service custom records. Add relevant consumable and transaction-line records through supported joins. Retrieve files only through established associations; do not guess folder names. See the [data model](../references/data-model.md) for record types and limits.

Confirm the date range, completion semantics for each task type, and unique task and line IDs. Return recent work, outcomes, pending issues and unavailable history sources. The owner and billable customer can differ. Looking up history does not authorize corrections to the hierarchy or inherited fields. See [assets](../references/assets.md) and [work management](../references/work-management.md).

## Review completion and outcomes

Resolve the Task or Case and establish what completion means for the request: performed work, submitted evidence, generated labor, Case closure or billing. Read status and type, scheduled and actual times, actions and outcome, and relevant service records. Inspect pending activity generation, Time Bills and Case or transaction results only as needed.

Use [work management](../references/work-management.md), [Mobile](../references/mobile.md), and [time](../references/time.md) to interpret completion and processing states. If the request concerns billing completion, use [billing](../references/billing.md) to distinguish order creation, fulfillment, invoice application and refreshed totals.

Outcome classification, a scheduled appointment or a completed parent save does not prove actual work, signatures or downstream processing. Completing work requires an action with established FSM completion semantics and configured consequences. Setting status, timestamps, signatures, close flags or processing flags does not reproduce that action.

Return recorded completion, actual evidence, pending or failed effects, and missing facts.

## Reconcile or record service time

Resolve the Task, Case and resource, the date window, and whether the request concerns hours, billability or invoicing. Read the `timebill` employee, date, duration, item, customer or Project, and Task links. Use the recorded duration unit when totaling hours. Billable state, approval and invoice application are distinct.

Compare entries with actual activities and pending generation using [Time Bill generation conditions](../references/time.md#generated-time-bills). Check coverage of employees and teams, along with processing and visibility limits, before treating a missing row as missing work. Deduplicate by Time Bill ID.

For manual time entry, establish the employee, customer, Project, item, Task, duration, billability and duplicate identity. Check pending automatic generation before creating an entry. Do not invent internal idempotency keys or populate costed or billed controls as part of time capture. Return verified hours and links, pending processing and discrepancies.

For financial interpretation, check the account's posting mechanism and report inclusion using [financial reporting context](../references/financial-reporting.md).

## Reconcile consumables and billing

Resolve the Case, Task and customer, and establish whether the request concerns recorded usage, fulfillment, billable value or invoices. Read the `customrecord_nx_consumable` item, quantity, Task, Case, Asset, Location, and serial, lot and order links. Compare the relevant order, fulfillment and invoice lines.

Use [materials and inventory](../references/materials-and-inventory.md) and [billing](../references/billing.md) to interpret CRM-task Consumables, project-task parts, inventory identifiers, effective billing rules and case-wide processing before valuing usage or proposing an entry.

Read the Case's unbilled components and calculated total where available. Label any locally computed total and avoid duplicate amounts from expanded joins. Distinguish usage, order creation, fulfillment and invoice application. Unprocessed Consumables are not yet sales-order unbilled value.

For material posting, establish inventory requirements, duplicate identity and billing consequences. Do not force processing by altering transaction links, status or recovery flags. Return quantities, transaction state, unbilled components, and exceptions involving pending processing or errors. Use [billing](../references/billing.md) for invoice and processing semantics.

For Asset-level reporting, check the saved Asset references on transaction bodies and item or expense lines, along with the requested period, against the [Asset capture paths](../references/financial-reporting.md#asset-capture-paths). Do this before concluding that a child Asset received attribution.
