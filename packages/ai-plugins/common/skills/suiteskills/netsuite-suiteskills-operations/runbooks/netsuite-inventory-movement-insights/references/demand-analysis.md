# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Demand analysis

Use **Demand** for an explicit historical period. Use **Open Demand** for current demand or a request without a historical period. An explicitly requested historical Demand metric without dates uses the main skill's 30-day period default. Read the [query catalog](query-catalog.md) and follow [retrieval and tools](retrieval-and-tools.md).

| Metric | Primary query | Meaning |
| --- | --- | --- |
| Demand | `queries/demand.sql` | Sales orders created in the inclusive period. For each currently closed line, use fulfilled quantity; otherwise use ordered quantity. Exclude pending-approval/cancelled statuses and drop-ship lines as encoded in the query. |
| Open Demand | `queries/open_demand.sql` | Current eligible open lines awaiting fulfillment. Sum `max(quantity − fulfilled quantity, 0)` per line. Exclude drop-ship lines. No date filter. |

Apply [account validation](account-validation.md) to the selected metric before definitive results or rankings. Reconcile current line state, status eligibility, drop-ship exclusions, quantities, and the applicable date basis; reuse relevant evidence. These are item/location quantities, not revenue. Historical Demand uses the line's current state; it is not a reconstruction of the order's state at period end.

## Answer the request

- For a specific location, report its value directly, including a verified zero. Do not call it the “highest” unless a complete comparison proves that.
- Show Unknown location demand separately as unallocated demand, outside warehouse rankings. Do not allocate it to a warehouse, interpret it as zero, or omit it from an explicitly requested all-location demand total.
- For demand-location rankings, qualify only values greater than zero. A singular highest request returns the winner and all ties; a list returns qualifying locations descending by the selected metric. Respect a requested count and keep ties at its boundary visible. After successful execution, applicable account validation, and complete coverage of the requested scope, no separate active-location census is needed for this positive-only ranking; fetch that list only for an answer that explicitly needs zero locations or a minimum including zeros. An unexplained Item metadata gap follows the bounded validation process; it is not an automatic exemption or a reason to invent a different query.
- For multiple results, use `Location | Demand` or `Location | Open Demand`, identify the highest location or tied locations, and state units. Add `Item` when needed.
- If no location qualifies after applicable validation, runtime checks, and complete retrieval, say no locations recorded qualifying Demand in the period, or no locations currently have qualifying Open Demand in the requested scope. The source filters define eligibility; a filtered zero is valid. Do not infer that no sales orders exist, add a table, or run an automatic broader count to explain the cause.
- If retrieval fails, is incomplete, or lacks the evidence required for the conclusion, withhold the affected definitive metric or overall ranking. Do not use the no-demand response. A complete but unreconciled result may be shown only as an unverified query result under account validation.

## Scope note

For Demand: “Historical demand uses fulfilled quantities for currently closed sales-order lines and ordered quantities for currently open lines on orders created during the selected period. Drop-ship lines and orders pending approval or cancelled are excluded. When all locations are selected, eligible lines with no location are retained in a separate Unknown location group. A specific-location request excludes that group.”

For Open Demand: “Open demand is the current unfulfilled quantity on eligible open sales-order lines awaiting fulfillment. Drop-ship lines are excluded. When all locations are selected, eligible lines with no location are retained in a separate Unknown location group; a specific-location request excludes it.”
