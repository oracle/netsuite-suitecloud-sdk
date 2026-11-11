# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Sales order shipping delays

## Query and meaning

Run `sales_order_ship_date_risk`. Keep one row per order and the executable order. Applicable ship date is the earliest per-line `expectedShipDate`, else `requestedDate`, else order `shipDate`, among eligible nonclosed item lines. The query includes orders with remaining unfulfilled quantity and an applicable date before asOfDate + 2 days (overdue, today, tomorrow). Item/location filters apply to contributing primary lines; do not call these totals whole-order quantities when filters narrow lines.

Source priority is NOT_ALLOCATED, READY, PICKED, then PACKED, followed by oldest applicable date and ID. Preserve that ranking internally; do not expose the stage as a risk assessment or Fulfillment status. Allocation calculations compare committed versus allocated using their greater value and subtract already picked/packed/fulfilled quantities without negative stage quantities.

For returned salesOrderIds, run `sales_order_fulfillment_status`. This evaluates **all** eligible open item lines for the orders, not just the line-filtered primary scope. It returns a label only when the full ordered quantity has reached at least Picked. Highest stage is fulfilled if total fulfilled equals total ordered; packed if the sum of each line's max(packed,fulfilled) equals total ordered; otherwise picked if the sum of max(picked,packed,fulfilled) equals total ordered.

Use current `ItemFulfillmentStatus` labels, preferring `companyPreferenceName` over `name`. The inherited query maps stages by status ID ordering; validate this picked/packed/shipped assumption before release, not through extra runtime reads. If enrichment fails or returned evidence contradicts that mapping, leave status unavailable and explain the limitation; do not replace it with a hardcoded label, Sales Order status, generic TransactionStatus, or the status of one related Item Fulfillment.

Example meaning: two units currently Picked plus three already Fulfilled gives Picked for a five-unit order, even if a related fulfillment says Shipped. All five Packed gives Packed. This describes stage meanings; display the account's returned labels, not these English labels when overridden.

Match by exact salesOrderId. No status row or a full quantity not yet at Picked leaves the cell blank; failed enrichment is also blank with a separate limitation explaining it was not checked. Do not pretend the two causes are identical. Do not run failed-pick enrichment.

## Output

Exact heading: `## Sales order shipping delay Exceptions`

One row bullets: **Sales order**, **Customer**, **Expected ship date**, **Fulfillment status**.

Multiple rows columns: `Sales order`, `Customer`, `Expected ship date`, `Fulfillment status`.

Copy `applicableShipDate` unchanged as `YYYY-MM-DD`. No carrier cutoff, task assignment, reason/risk assessment, or Recommended actions. Preserve each returned order and verified links.

No results: `No sales orders nearing or past their expected ship date were found for the checked criteria.`

Unavailable: `Sales order shipping delay data is unavailable in the current context.`

## Explicit guidance only

Explain that the review lists unfulfilled orders due by tomorrow and tracks the stage reached by the full quantity. Operational staff can review their normal allocation, picking, packing and shipping process; do not assert a cause, task assignment or action eligibility.
