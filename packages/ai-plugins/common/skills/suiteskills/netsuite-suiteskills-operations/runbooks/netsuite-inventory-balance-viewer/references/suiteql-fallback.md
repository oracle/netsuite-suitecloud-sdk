This reference governs the detailed InventoryBalance adapter only. The independently qualified item-location alternative in [connection.md](connection.md#qualified-item-location-fallback) is permitted for its narrower grain; its fields and access must be separately verified.

# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Narrow SuiteQL fallback adapter

Use this adapter only when no compatible dedicated current inventory-balance read is available and an authorized generic SuiteQL read is available. Apply the evidence ladder in `connection.md` first. This adapter is not permission to invent another table, field, join, function, or query shape.

## Source and fields

Use only the exact `InventoryBalance` table. The static authoring field set is in `known-good-suiteql-fields.json`.

Choose the smallest row profile that can answer the request:

- Item profile: `item`, `quantityOnHand`, `quantityAvailable`.
- Location profile: add `location`.
- Bin profile: add `location` and `binNumber`.

Also verify any field used only as a filter. For example, an item-level answer filtered to one location still requires `location` to be verified even if location is not selected for display.

Do not select inventory status, inventory number, transaction, costing, committed, allocated, backordered, or planning fields through this adapter.

## Qualification probe

When live metadata lists `InventoryBalance` but does not enumerate fields, and every required field is present in the static reference, allow exactly one bounded probe for the required field set:

```sql
SELECT <required fields>
FROM InventoryBalance
WHERE ROWNUM <= 1
```

Use explicit field names, not `SELECT *`. The probe contains no user values, joins, aggregation, functions, or predicates other than `ROWNUM <= 1`. A successful zero-row response still establishes that the table/columns parsed. Unknown-table, unknown-field, syntax-validation, or access errors block the adapter. Do not retry the same failed probe unchanged.

## Analytical query shape

After qualification, build only this row-level shape with the fields required for the selected profile:

```sql
SELECT
  ib.item AS item_id,
  ib.location AS location_id,
  ib.binNumber AS bin_id,
  ib.quantityOnHand AS quantity_on_hand,
  ib.quantityAvailable AS quantity_available
FROM InventoryBalance ib
WHERE <validated internal-ID filters only>
ORDER BY ib.item, ib.location, ib.binNumber
```

Omit `location` or `binNumber` from `SELECT` and `ORDER BY` when the selected profile does not require them. Omit the `WHERE` clause only for an explicitly requested bounded overview that the workflow allows. Never replace a missing filter with a name or arbitrary user text.

Allowed predicates are equality or a finite `IN (...)` list over resolved internal IDs for `item`, `location`, and `binNumber`. Use bound parameters when the connector supports them. Otherwise use only the connector's documented safe literal encoding for already validated internal IDs. Do not interpolate names, free text, dates, expressions, comments, or raw user SQL.

Do not add joins, `BUILTIN.DF`, aggregation, subqueries, CTEs, formulas, or alternate tables. Resolve display labels before retrieval or present clearly labeled IDs when labels are unavailable. Aggregate returned rows once in the skill workflow to the requested item/location/bin grain.

Use the connector's documented page size/limit and completeness metadata for one bounded response. Do not fetch subsequent pages. Do not guess a SQL row cap for the analytical query. If the returned page is limited or truncated, preserve it as limited evidence rather than changing the query to manufacture completeness.

## Disclosure

If this adapter is qualified through the metadata-enumeration fallback, disclose once in the answer:

`Schema verification fallback used for InventoryBalance; live metadata exposed the table but did not enumerate its fields.`

This disclosure does not convert a failed, denied, empty, or truncated read into complete inventory evidence.
