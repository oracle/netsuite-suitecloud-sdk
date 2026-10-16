# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Overdue inbound orders

## Query and meaning

Run both `inbound_po_overdue` and `inbound_transfer_order_overdue` unless the request limits type. A vendor or specific PO filter selects PO only; a specific TO selects TO only. Conflicting explicit PO-only/TO-only filters require clarification. Never retrieve inbound shipments or use expected ship date.

Qualifying lines are not closed, have an item and non-null expected receipt date strictly before asOfDate, and positive `ABS(quantity) - ABS(quantityReceived)`. TO rows additionally use destination location and negative signed quantity; these semantics belong to pre-release validation. Preserve every bounded row from each successful query. If one type fails, retain the other as partial; no-results requires every applicable primary query to succeed empty.

Combine in one table, sorted expectedReceiptDate ascending, quantityOpen descending, transaction number, line ID. Keep one row per inbound line; for multiple direct links to a PO line, expand one row per line/link pair without summing quantities. Expected items is `<returned item display> x <quantityOpen>`.

For returned POs, run `inbound_po_linked_sales_orders` on exactly those purchaseOrderIds. Match purchaseOrderId **and** purchaseOrderLineId. Only direct raw DropShip/SpecOrd links qualify; do not filter on localized display labels or infer generic demand from stock shortages. The source query sorts before its 500-link SQL cap. Retrieve one bounded response only and disclose possible missing links whenever the response or SQL cap is reached.

The inherited column name is **Impacted open orders**, but the source link query establishes a direct relationship only; it does not establish whether the SO is still open. Preserve the source query and rows. Where current open-state evidence is absent, mark the linked result `Open status not verified` and explain this once. Never silently label a closed/unknown order as open or silently remove links to change the source population. A verified closed link is shown as such. Filtering closed links from the population is a separate business change.

`transaction_refs` may retrieve exact IDs from both primary sources through the packaged exact-ID query. Its portable result is an ID, not a guaranteed UI URL. The Transaction label remains the exact internal transaction ID, linked only when an observed UI URL exists; otherwise show the ID and disclose unavailable links. Typed vendor/SO reads are optional enrichment for returned IDs only; use observed labels already available when possible.

TO Vendor and Impacted open orders are `Not applicable for transfer orders`. For a PO line with successful complete link retrieval and no links use `None found`. Failed/incomplete linkage is `Unavailable in the current context`, not None found. Preserve rows when optional vendor/transaction/link enrichment fails.

## Output

Exact heading: `## Overdue inbound orders Exceptions`

One row uses these bullets in order: **Transaction**, **Vendor**, **Expected receipt date**, **Days overdue**, **Expected items**, **Impacted open orders**.

Multiple primary or presentation rows use one combined table with exactly: `Transaction`, `Vendor`, `Expected receipt date`, `Days overdue`, `Expected items`, `Impacted open orders`. No separate PO/TO sections, transaction-number column, or Recommended actions. Preserve expectedReceiptDate as the returned `YYYY-MM-DD` string.

No results: `No overdue inbound orders were found for the checked criteria.`

Unavailable: `Overdue inbound order data is unavailable in the current context.`

## Explicit guidance only

Explain that POs need vendor/carrier receipt-date confirmation and TOs need source-location/shipment review. Warehouse staff may follow their normal receiving/expediting procedures. During this explanatory mode, do not add a Recommended actions section, discuss inbound shipments, or claim current records were checked without evidence. A separately requested receiving or expediting action requires the shared action contract, current record validation and applicable warehouse procedure.
