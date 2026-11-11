# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Movement analysis

Use the requested period, or the last 30 calendar days including today. Read the [query catalog](query-catalog.md) and follow [retrieval and tools](retrieval-and-tools.md).

## Calculate movement

| Metric | Primary query | Source basis |
| --- | --- | --- |
| Incoming Movement | `queries/incoming_movement.sql` | Item receipts created in the period with restock true (null defaults to true), plus positive inventory adjustments created in the period. |
| Outgoing Movement | `queries/outgoing_movement.sql` | Current shipped fulfillment quantities attributed to their latest transition to Shipped in the period, plus absolute negative inventory adjustments created in the period. |
| Net Movement | Both above | `incomingMovement − outgoingMovement`, after both inputs complete for the same item/location and dates. |

Preserve the exact query filters and history logic, including its original null-parent/status path, while applying [account validation](account-validation.md). Outgoing fulfillment quantities are current quantities, not necessarily quantities frozen at the shipping event. Check or reuse relevant Item and TransactionHistory metadata; unexplained omissions permit bounded validation, not unconditional acceptance. Reconcile receipt/adjustment signs and dates, and separately reconcile the latest shipping transition and current fulfillment quantity for Outgoing Movement. Preserve the immediately preceding eligible history event when scoping a transition check. A successful unrelated query or an empty result does not validate that history logic. Withhold definitive movement, net, or trend claims whose required inputs remain materially unverified. On actual query failure, do not substitute transaction date, posting period, fulfillment creation date, or zero.

## Select locations

- Always report an explicitly requested location, even if its result is zero.
- For consumption, outgoing exceeding incoming, or net reduction, select `netMovement < 0`. The largest reduction has the most negative Net Movement; preserve ties.
- For incoming exceeding outgoing or net increase, select `netMovement > 0`. The largest increase has the greatest Net Movement; preserve ties.
- Describe negative net as net outflow using its absolute magnitude, positive net as net inflow, and zero as balanced movement. Call zero “no movement” only when both Incoming and Outgoing are zero.
- If no location qualifies in a complete result, say no location met the requested condition during the period.

For one location, give the direct conclusion plus Incoming Movement, Outgoing Movement, and Net Movement in units. For several locations, use `Location | Incoming Movement | Outgoing Movement | Net Movement`. Show only requested metrics for a simple single-metric question.

## Movement summary

For definitive movement results, require applicable validation of every input; otherwise follow the qualified-result rules in account validation. For a general summary, use the requested location scope; if none is supplied, use all active locations. Sum complete item/location results into Total Incoming, Total Outgoing, and Total Net Movement **separately for each item**.

- No incoming or outgoing movement: say no movement was recorded in the verified scope and period; omit unnecessary totals.
- Movement at one location: give aggregate net direction and the three totals; identify the only location with movement.
- Movement at several locations: give the three totals and highest/lowest Incoming, Outgoing, and Net Movement, preserving ties. Establish whether zero-movement locations belong in the extrema comparison. If that ambiguity changes the answer, ask a focused question while providing supported totals. An all-active-location minimum needs the complete eligible location set, including verified zeros.

## Movement trend

Unless the user supplies comparison dates, compare with the immediately preceding, non-overlapping period of the same calendar-day length. For a current inclusive interval `[start, end]`, let `N = (end − start).days + 1`; then `previousEnd = start − 1 day` and `previousStart = start − N days`.

Calculate Incoming, Outgoing, and Net Movement for both periods, then:

`movementTrend = currentNetMovement − previousNetMovement`

Report the current Incoming, Outgoing, and Net Movement, then say how Net Movement changed in units from the previous value to the current value. An increase means a more positive net balance; it does not necessarily mean more gross movement. If the user specifically asks for an incoming/outgoing trend, compare that requested metric too. Do not invent percentage growth when the prior value is zero.

If both periods have complete results with applicable validation and neither has movement, give a concise no-movement statement covering both periods. A failed or partial comparison period prevents a complete trend claim but does not invalidate independently complete current-period results.

## Scope note

“Incoming movement includes qualifying item receipts and positive inventory adjustments. Outgoing movement includes shipped item fulfillments and negative inventory adjustments. Receipts and adjustments use creation dates; fulfillments use the latest transition to Shipped. Sources outside these definitions are excluded.”

### Sparse-history fallback

An empty history result does not prove zero shipments. Compare history coverage with independently supported in-scope fulfillment evidence. The [shipped-fulfillment query](../queries/shipped_fulfillment_fallback.sql) is a distinct, metadata-qualified fallback for current shipped quantities by transaction date. It omits adjustments and does not reconstruct shipment-event timestamps. Label the narrower metric and date basis, retain units/item/location grain, and withhold original outgoing/net-movement conclusions when that equivalence cannot be established. A denial is not permission to use the fallback. Do not add the fallback to history results, which would double count shipments.
