# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Query parameters

Use the exact parameter names and types in [catalog.json](../queries/catalog.json). Supply every parameter; the compiler does not fill missing input. Treat IDs as positive integers, not names. ALL record scope means an empty ID array; SELECTED requires one or more IDs. Do not set ALL when the user requested an unresolved filter. Unsupported filters require clarification or a proven equivalent source.

Common defaults:

- Primary `maxRows`: 25; smaller requested positive limits are allowed. Larger requested primary limits cannot exceed 100 and remain bounded.
- `asOfDate`: current account business date, `YYYY-MM-DD`, only when account timezone is known; otherwise ask. An explicit supplied business date takes precedence.
- `asOfDateTime`: account-local `YYYY-MM-DD HH:MM:SS`, with account timezone recorded separately; never append a timezone to this literal.
- Omitted record filters: scope `ALL`, IDs `[]`.
- Negative transaction enrichment: only IDs from the primary result, `maxRows: 625`; retrieve one response of at most 100 rows. The SQL cap does not promise 625 retrieved rows. Disclose incomplete pair coverage; do not paginate.
- Unused expired-lot date bounds: set both to `asOfDate`; unused quantity bounds: 0.

| Query ID | Complete input families |
|---|---|
| `negative_inventory_quantity` | locationScope/locationIds, itemScope/itemIds, maxRows |
| `negative_inventory_transactions` | itemIds, locationIds, maxRows |
| `inbound_po_overdue` | asOfDate, purchaseOrderScope/purchaseOrderIds, locationScope/locationIds, vendorScope/vendorIds, itemScope/itemIds, maxRows |
| `inbound_transfer_order_overdue` | asOfDate, transferOrderScope/transferOrderIds, locationScope/locationIds, itemScope/itemIds, maxRows |
| `inbound_po_linked_sales_orders` | purchaseOrderIds |
| `sales_order_ship_date_risk` | asOfDate, salesOrderScope/salesOrderIds, customerScope/customerIds, locationScope/locationIds, itemScope/itemIds, maxRows |
| `sales_order_fulfillment_status` | salesOrderIds |
| `failed_pick_tasks` | locationScope/locationIds, itemScope/itemIds, maxRows |
| `expired_lots` | asOfDate, locationScope/locationIds, itemScope/itemIds, inventoryNumberScope/inventoryNumberIds, binScope/binIds, expirationDateScope/expirationDateFrom/expirationDateTo, quantityOnHandScope/minimumQuantityOnHand/maximumQuantityOnHand, maxRows |
| `putaway_aging` | asOfDateTime, minimumAgingHours, putawayAreaScope, locationScope/locationIds, itemScope/itemIds, binScope/binIds, maxRows |
| `putaway_balances` | putawayAreaScope, locationScope/locationIds, itemScope/itemIds, binScope/binIds, maxRows (age-unavailable fallback only) |
| `putaway_aging_no_bin` | asOfDateTime, minimumAgingHours, locationScope/locationIds, itemScope/itemIds, maxRows; null bins only |
| `putaway_balances_no_bin` | locationScope/locationIds, itemScope/itemIds, maxRows; null bins only, age unavailable |
| `transaction_refs` | transactionIds |

`expirationDateScope`: ALL, FROM, THROUGH, RANGE. Bounds are inclusive; RANGE must be chronological. Even an expanded requested date range does not expand the source's “expired or within one day” population. Explain that limitation rather than silently changing the predicate.

`quantityOnHandScope`: ALL, MINIMUM, RANGE. Bounds filter aggregate on-hand within each lot/location/bin combination, not across the warehouse. RANGE minimum must not exceed maximum.

`putawayAreaScope`: ALL, NO_BIN, INBOUND_STAGING. `minimumAgingHours` is required from the user and nonnegative; the source qualifies elapsed hours **greater than or equal to** it. Preserve that inclusive boundary when explaining “over” the threshold.

Example complete negative-inventory input with no filters:

```json
{"locationScope":"ALL","locationIds":[],"itemScope":"ALL","itemIds":[],"maxRows":25}
```

Source capped queries do not prove complete account totals. Do not recalculate dates in UTC, add unavailable predicates, or widen arrays to obtain more rows.

The null-bin variants have no putaway-area or bin-ID parameters because their scope is fixed to `binNumber IS NULL`. Do not use them to silently drop an explicit non-null bin filter. Follow the selection and disclosure rules in [putaway-aging.md](putaway-aging.md).
