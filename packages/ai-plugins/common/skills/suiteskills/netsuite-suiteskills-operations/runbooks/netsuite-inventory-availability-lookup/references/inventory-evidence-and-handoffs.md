# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Inventory evidence and handoffs

Read this reference only for a quantity interpretation, location/status distinction, backorder
question, or operational handoff. It governs evidence handling for
`netsuite-inventory-availability-lookup`; it does not authorize inventory or order changes.

## Contents

1. Quantity evidence
2. Current-balance and report sources
3. Location, status, bin, and unit scope
4. Transfer and in-transit scope
5. Backorder and order-specific boundaries
6. Recorded balance and physical-count boundaries
7. Safe answer shapes and handoff
8. Account-validation questions

## 1. Quantity evidence

NetSuite's inventory views can expose related quantities with different meanings. Preserve the
label and scope returned by the accessible source instead of relabeling one quantity as another.

| Quantity label | Safe interpretation for this skill | Do not infer |
| --- | --- | --- |
| On hand | The quantity NetSuite reports as on hand for the selected accessible source and scope. | That it proves physical presence, count accuracy, condition, is uncommitted, sellable, or available to a specific transaction. |
| Available | The currently available quantity reported by the selected accessible source and scope. NetSuite documents it as on hand less committed for its stock-level view. | A reservation, allocation, fulfillment, shipment, delivery, or future availability. |
| Committed | Quantity that the selected source reports as committed. | Which order owns it, whether it can be reallocated, or when it will be released. |
| On order | Quantity that the selected source reports as on order. | Receipt date, vendor certainty, or current availability. |
| In transit | Quantity that the selected source reports as in transit for its item/location scope. | That it is currently on hand or available at the destination, when it will arrive, or that a transfer is complete. |
| Backordered | Quantity the selected source reports as backordered. | A particular customer commitment, priority, or replenishment outcome. |
| Null or no returned row | The selected source did not return a reported quantity or balance row for that item/location/scope. Render an unreported table value as `—` and explain that legend once. | That the quantity is zero, that no inventory record exists in NetSuite, or that the item has no stock at that location. |

Only compare a requested quantity to an available quantity when item identity, unit, location,
inventory status, and snapshot scope align. If any are not accessible, report the quantities as
separate evidence and say that the requested comparison cannot be established.

When the user asks in a different unit—such as cases, packs, or an alternate sales unit—do not
assume it equals the source quantity's unit or provide a conditional yes/no answer. Verify the
item-specific conversion and both source/requested units first. If that evidence is unavailable,
state the available quantity in the source unit and the exact conversion limitation.

## 2. Current-balance and report sources

For one selected item and location, prefer a focused current-balance source when the account and
role expose one. NetSuite's Inventory Balance search is designed to return item balances by
criteria and can expose bin, location, lot or serial number, on-hand, available, and inventory
status values. Confirm the account's available fields, filters, and permissions before relying on
that path.

### Item-wide totals

For a question asking how much of one item is on hand, available, committed, on order, or
backordered without requesting a location breakdown, prefer a metadata-confirmed `inventoryitem`
source when it returns every requested item-wide quantity in the same unit and accessible scope.
Label the result as an item-wide source total, not as a physical count or an order outcome.

When the item-wide source returns only some requested quantities, retain every compatible returned
total as separate direct evidence. For example, report an item-wide on-hand total separately from a
per-location available/committed/on-order breakdown whose complete aggregate cannot be established.
Do not discard the direct total, fill in the missing totals, or use a heading that implies the
mixed sources form one complete item-wide total.

If an item-wide total source is unavailable, incomplete, or cannot establish compatible quantity
semantics, use current-balance rows only as per-location evidence. Do not use `COALESCE`, replace
null with zero, add only the non-null rows, or call a row-limited/incomplete population an
all-location total. State the returned rows and values separately, along with the precise missing
total or population limitation. A total derived from location rows is allowed only after the
current source proves complete item/location population, compatible unit and status scope, and the
meaning of null and absent rows.

### Standard SuiteQL candidates and focused fast path

Where the relevant inventory features are enabled, use these standard SuiteQL candidates for a
focused item/location lookup. The current Connector role and query surface can still restrict a
standard source, field, or function. Confirm availability and the required field meanings through
the current account's Records Catalog or a narrow, read-only validation before relying on one.

| Candidate | Appropriate use | Guardrail |
| --- | --- | --- |
| `item` | Narrow item-name or SKU resolution before a dependent lookup. | Resolve only plausible matches; do not treat a partial-name match as the selected item. |
| `inventoryitem` | Item-level inventory context. | Its totals do not establish a balance at one selected location. |
| `inventoryItemLocations` | Current quantities for one selected item/location scope. | Prefer it when it exposes the required current-balance fields and the result grain matches the question. |
| `aggregateItemLocation` | A possible item/location rollup when the primary current-balance candidate is unavailable. | Use only after validating its aggregation grain, filters, and quantity meanings; never substitute an untested rollup for the requested balance. It can also expose an availability-change timestamp when the current metadata confirms that field. |
| `kitItemMember` | Component composition for a selected Kit/Package item. | Use only when current metadata validates the relationship and required member quantity. It does not establish a Kit/Package balance by itself. |

For the selected location's readable display label, use `BUILTIN.DF(location)` only when that
field and function work in the validated query path. Its output is a display label, not evidence of
the location's city, street address, or physical warehouse identity.

Use a direct SuiteQL path only after the current Connector account and role validate its selected
candidate's table, fields, relationship shape, result grain, predicates, and row cap. For one
selected item/location question, resolve the item narrowly, then use one bounded current-balance
query that returns the requested quantities, the available location display label when supported,
and a source timestamp when accessible. This avoids a second balance query solely to resolve a
reference label.

When the user supplies a city or other physical-place name but not a validated NetSuite location,
do not make a separate guessed table lookup. Use the selected item's bounded balance query to
return only the needed location display labels and quantities, with an explicit row cap. If the cap
prevents a complete candidate comparison, say so rather than declaring that a matching location is
absent. Use a direct `location` record or location search only when that path has already been
validated for the current role and can establish that the selected balance location is the same
physical site.

If the user reports a location-permission or access change, refresh only the necessary
location/address metadata once. A metadata relationship or `joinable` marker identifies a candidate
path; it does not prove that a particular SuiteQL `JOIN` direction, key, or object-field expression
will work. Validate one minimal, selected-location relationship path before relying on it. If it
fails or returns no matching row, do not try alternate guessed keys or serial joins. Use an already
validated direct record/subrecord path when available; otherwise return the balance label and state
the exact city/site limitation.

Do not list saved searches, enumerate reports, issue a broad metadata-catalog call, or try several
guessed table names before this focused path. Those are not cheaper evidence for a single current
balance. If the direct SuiteQL path is unavailable, use the next smallest validated source in this
order:

1. a focused current-balance record or Inventory Balance search;
2. an existing bounded saved search whose definition and result grain are known to return the
   requested current item/location scope; then
3. a precise limitation and handoff when no validated source can establish that scope.

Never substitute transaction-detail rows, an item-wide total, or an untested aggregate/rollup
source for a selected item/location balance. A candidate source becomes usable only after its
quantity meanings, aggregation grain, filters, and scope have been validated for the current
account and role.

### Matrix child availability

For a selected Matrix child or variant, resolve and use that child as the item in the current-balance
path. A Matrix parent/grid can present related child quantities, but it is not a substitute for the
selected child's current item/location balance; neither are sibling-variant quantities. Apply the
selected child's validated item type to the route in the preceding section: for example, use the
Kit/Package route only when the selected child itself is validated as a Kit/Package item. If no
direct compatible balance is accessible for the selected child, state that limitation rather than
deriving a quantity from the Matrix parent or other variants.

### Kit/Package component availability

First identify the selected item's type in the narrow identity read. For a Kit/Package item, use a
validated component-composition path instead of first attempting the kit itself in a current-balance
source. NetSuite documents Kit/Package inventory as tracked through its members. An Assembly item
has separately tracked assembly stock, so do not send it through the Kit/Package component path
without a distinct, validated assembly workflow.

For an Assembly item, use its direct current-balance path first. If that source returns no balance
rows and an item-wide source returns no compatible quantity, report that current assembly
availability cannot be established from accessible NetSuite evidence. Do not convert no rows or
null to zero, calculate the assembly's available quantity from member components, or explain the
gap as an unverified build, receipt, or configuration condition.

For a selected Kit/Package and location, retrieve the required member items and their required
quantities, then retrieve the members' balances in one bounded query for that same location and
comparable unit/status scope. A derived component-based upper bound is allowed only when every
required member's available quantity and required quantity are reported in compatible scope. Label
it as a component-based estimate, not a kit balance, reservation, fulfillment outcome, or promise.
If any required component is reported as zero available at the selected location, the component
evidence supports a zero component-based upper bound there. If a required member, quantity, unit,
status, or location row is unreported, state the limitation rather than treating it as zero or
deriving a kit figure. Do not call a set of returned locations every location, or infer availability
at a different location from component rows elsewhere.

For Kit/Package components that are non-inventory, service, or otherwise lack compatible inventory
availability, do not assume they are unlimited or constraining. State that the component-based
inventory figure cannot be established without an approved, validated availability meaning for that
component type.

For a Service item, do not present on-hand, available, committed, or backordered stock values. A
service may have scheduling, capacity, or related-part considerations, but they are distinct
workflows and are not a substitute for inventory evidence. State that a physical-stock answer is
not available for the selected service item, and ask the user to identify a specific
inventory-tracked item when appropriate. Do not infer that related item from the service name.

### Availability-change timestamp

When a user specifically asks when availability last changed, a validated current-balance source
may return `lastQuantityAvailableChange` for the same selected item/location scope. NetSuite
documents that field as updating when an inventory-affecting transaction is entered or edited.
Report it as the recorded availability-change time with its returned time-zone context when
available.

Do not use it as the default freshness field for a current balance, or equate it with an item
record's last-modified time, the time this query ran, a physical count, carrier movement, receipt,
or a promise that stock remains available. If the field is unavailable, report the current balance
and any separate source timestamp that is accessible; do not infer when availability changed.

Do not use an Inventory Detail search as the default answer to “what is available now.” Its rows
describe inventory-detail records and transaction impacts; a quantity can be an absolute
transaction quantity while an item count indicates a positive or negative impact. This skill does
not own inventory-history investigations. Do not derive a current balance by adding or interpreting
partial rows; provide the current-balance limitation and hand off a history investigation to the
authorized inventory-control process.

For a governed inventory-level aggregate, including an accessible backorder population, prefer an
accessible inventory report or saved search. The Current Inventory Snapshot is a report-time
snapshot, not a historical-period view; its field scope can differ by location and some values are
tied to the preferred location. State the report time, filters, and material location limitation.
Do not expose vendor, cost, or replenishment-policy data unless the authorized question requires
it. A report may establish an inventory-level fact relevant to replenishment, but this skill does
not recommend reorder points, replenishment quantities, purchasing, or inventory movement.

## 3. Location, status, bin, and unit scope

Inventory can be location-specific. A location on an item, customer, or transaction does not prove
that the selected location has the requested current quantity. Retrieve the item/location balance
or state the limitation.

A returned location display label does not establish its city, street address, or physical
warehouse identity. When a physical-place answer is material, resolve the user-supplied place
narrowly through an already validated `location` record or search path, or one targeted validation
after a reported access change. Then verify that its stable reference is the same as the selected
balance location. Do not query a literal city through an unvalidated Location table or infer that a
state/region label represents a city. If an already validated location-record path can verify the
requested city/address, use it before asking the user to confirm a state/region label. If no
accessible path can verify the requested city/address, state that the current balance evidence
identifies only the returned label and ask the user to confirm whether it is the intended location.

Inventory status, bins, lots, serial numbers, and units can also change what is usable for the
user's question. When the source separates these dimensions:

- retain the displayed status or bin/lot/serial scope rather than merging totals;
- do not expose lot or serial identifiers unless necessary for the authorized request;
- do not assume that on-hand quantity in a restricted status is available;
- do not compare different units without a verified item-specific conversion; and
- state when an account feature, role permission, or available source prevents that breakdown.

Positive on-hand quantity with zero committed and zero available is a reconciliation signal, not
proof of a misconfiguration. NetSuite's Inventory Status feature can retain quantity on hand while
excluding it from availability for commitment, and a location-level availability setting can permit
stocking inventory while excluding it from commitment. First confirm that the compared fields share
item, location, unit, status, bin, and snapshot scope. When a validated status/bin/unit balance path
or selected-location availability-setting path is available, retrieve only the minimal evidence and
report the returned scope. If it is unavailable, preserve the reported values and state that the
reason cannot be established. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.

For a multi-location comparison, use a compact table with location, quantity label, quantity, and
unit. Include only locations necessary to answer the request, and state if the accessible population
may be incomplete.

Use these separate columns for a per-location comparison when the requested quantities are
available. Preserve the labels and do not combine header cells; allow the host's normal table
styling.

```markdown
| Location | On hand | Available | Committed | On order | Backordered | Source last modified |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
```

Use `0` only for a numeric zero returned by NetSuite. Use `—` when a field is unreported; state
once below the table that `—` is not zero. Both a reported zero and any other reported quantity are
recorded NetSuite values, not a physical-count result. The final column is only for a source
last-modified time; never substitute `lastQuantityAvailableChange` or call it ordinary freshness.
Do not include that time in a standard availability response merely because it is returned. If the
user asks for timing, label it as source last-modified time, not as the balance's “as of” time.
Introduce this table as per returned location evidence. Unless its source proves complete compatible
population and aggregation, state that it is not an item-wide total.

### Multi-location comparison and location classification

Resolve the requested comparison set before retrieving balances. When several selected locations
are in scope, use one bounded current-balance query for the selected item and those resolved
location references. A list predicate is appropriate only for that already resolved, explicitly
capped set; do not issue one balance query per location or scan an unbounded location population to
build a comparison.

“Warehouse,” “store,” and similar words can be business terms rather than a location name. When
the current role exposes and metadata validates `locationType`, use its returned display value—such
as through a validated display function—to establish a technical classification scope. Do not infer
the classification from a name or address. Say “locations classified as Warehouse” (or the returned
label), not “all warehouses,” unless approved company guidance establishes that equivalence. Keep
untyped, inaccessible, and excluded locations separate; none proves that the location is or is not
a warehouse for the user's operational purpose.

City, address, and location contact information are not required for a classification-based balance
comparison. Retrieve them only when the user asks for them or when they are necessary to distinguish
otherwise plausible locations; do not add address lookups merely to enrich a comparison table.

## 4. Transfer and in-transit scope

In-transit and destination on-order quantities are not current destination on-hand or available
quantity. A basic transfer and a transfer order are operational transactions with different timing;
an approved transfer order can commit source inventory and increase destination on-order quantity,
while destination on-hand increases only on receipt. Preserve the source label, location, and
snapshot rather than treating an in-transit or on-order amount as sellable stock at the destination.

Do not infer an in-transit quantity from a table that does not return an in-transit field, from a
zero in another quantity column, or from the absence of a transfer in the current conversation. A
word such as “destination” does not establish a destination location or a transfer. Ask for the
destination when it is not selected. Once it is selected, report current destination available and
in-transit values only if the same validated scope exposes each requested field; otherwise state
which fact is not accessible. Keep the two values separate even when both are present.

Even when a selected destination reports numeric zero in transit and a positive available quantity,
describe that as NetSuite's recorded destination quantities. Do not say that units are physically
“sitting” at a location, that their transfer state is physically confirmed, or that a receipt is
complete without the relevant physical-count or receipt evidence.

For requested changes, follow the shared action contract: establish exact scope, authorization, supported capability and business prerequisites, then verify the outcome. If a user
needs to move stock, provide the verified source/destination fact and hand off to the authorized
inventory or transfer-order process. Ownership, subsidiary, accounting, approval, and timing rules
are account-specific and are outside this skill.

## 5. Backorder and order-specific boundaries

An accessible inventory-backorder report can answer a governed portfolio question when its filters,
population, and completeness are verified. Do not reconstruct it from partial transaction rows or
call the result complete when pagination or access scope is uncertain.

Questions such as “why is this order backordered?”, “can this sales-order line be committed?”, “is
this order ready to fulfill?”, or “when will this order ship?” require the selected order, its line
state, and linked fulfillment or billing evidence. Route those questions to **NetSuite Customer
Service Order Triage**. A prospective lookup may carry only the current selected item/location fact
forward; it does not establish an order outcome.

For inventory reporting that includes kits or assembly members, preserve the report's item and
filter scope. A component quantity can be included both as an individual item and as part of a kit,
which can look like double counting. Do not total displayed lines or claim a complete commitment or
backorder quantity until the report's kit/assembly-member treatment is verified.

For an item-level backorder question answered from location rows, summarize only the row values that
are actually reported. If some returned locations show numeric `0` and others show `—`, say that
backordered quantity is reported as zero at the named locations and unreported at the others. Do
not say there is no backordered quantity anywhere, that every location is zero, or that the item has
no backorder unless a compatible complete population reports numeric zero throughout. Do not call
locations with reported quantities the only locations “carrying stock,” or say the remaining
locations do not stock the item: an unreported on-hand or committed field does not establish that
classification.

## 6. Recorded balance and physical-count boundaries

An accessible current balance establishes only what NetSuite records for the selected item, scope,
and snapshot. It does not establish that goods are physically present, undamaged, unexpired,
correctly counted, or ready for a particular warehouse operation. A physical-count worksheet or
cycle-count process compares physical inventory with the account's recorded quantity; it is not a
reason to adjust a record from this skill.

For a discrepancy, report the smallest verified contrast—such as the selected item/location's
recorded quantity and an explicitly supplied physical-count observation—without deciding which is
correct. Do not expose count sheets, vendor data, cost, or internal notes unless necessary for the
authorized question. Hand off investigation, counting, inventory status decisions, and any
adjustment to the authorized inventory-control process.

## 7. Safe answer shapes and handoff

For a direct current-availability question, provide:

1. selected item and requested quantity/unit;
2. current quantity labels and values in their verified scope;
3. location/status/unit and freshness limitations that could change the result; and
4. a factual next step, if needed, without promising or reserving stock.

For a request to allocate, transfer, adjust, replenish, fulfill, or update inventory, state that
this skill does not change records. Identify the verified item/location context and hand off to the
authorized inventory, warehouse, fulfillment, or order-management process. Do not recommend an
allocation or replenishment decision. If an approved policy is accessible, state only the relevant
policy fact and still hand off the decision and execution to its authorized owner.

## 8. Account-validation questions

Before treating a source or field as an account-wide workflow, validate it in a connected,
non-production account and record the result in internal testing notes:

- accessible item and inventory-balance record/query/report path and its actual quantity labels;
- whether an Inventory Balance source returns the required item/location/status/bin/number scope,
  and whether Inventory Detail rows are available only as transaction-history evidence;
- item/location, unit, inventory-status, bin, lot, and serial behavior under the connector role;
- current-snapshot report filters, generated-time behavior, preferred-location field behavior, and
  kit/assembly-member treatment before using it for a governed aggregate;
- source/destination, in-transit, on-order, and receipt behavior for any transfer evidence the
  intended roles can access;
- recorded-balance, physical-count, count-sheet, and discrepancy-access behavior under warehouse
  and inventory-control roles, including the controlled handoff when a variance is found;
- whether the accessible backorder report or saved search has complete, governed population scope;
- permission-denied and empty-result behavior for warehouse and sales roles; and
- the exact boundary between a prospective item lookup and the account's order-allocation process.

Until validated, do not hardcode field IDs, status labels, availability rules, or replenishment
timing. Treat the standard candidate table names above as candidates, not as proof that the current
role can query them or that they answer the requested scope.
