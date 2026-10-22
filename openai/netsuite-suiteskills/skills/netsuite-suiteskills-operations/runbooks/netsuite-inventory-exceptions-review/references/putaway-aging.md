# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Putaway aging

## Query and meaning

Require a user-supplied SLA threshold; convert days to hours. Run `putaway_aging` only after it and account-local asOfDateTime are established. Default putawayAreaScope is ALL; restrict to NO_BIN or INBOUND_STAGING only when requested. The source uses elapsed hours >= threshold, including equality.

Qualifying current balances have positive on-hand in a null bin or inbound staging bin. Match positive Item Receipt assignments to each balance by item, location, bin, inventory number and inventory status. Use the receipt **transaction date**, never InventoryBalance creation date or Item Receipt record creation timestamp.

For each balance, order matching receipt layers newest first by transaction date, receipt ID, receipt line ID, assignment ID. Accumulate received quantities. The date of the first layer whose cumulative quantity reaches/exceeds current on-hand is agingStartDate. If on-hand is 5 and receipts are 3 today plus 5 yesterday, use yesterday. If positive receipt history cannot cover on-hand, do not report an SLA-qualified exception for that balance or invent a fallback age.

The source compares null inventory status using a fallback internal value 1. Validate that convention before release; do not add runtime schema checks or change the default during execution. The source's date-level receipt-layer approximation is not physical dwell-time telemetry; do not describe it as an exact movement timestamp.

Use returned numeric agingHours, rounded by the source to one decimal from midnight at agingStartDate to asOfDateTime. Format weeks = floor(hours / 168), days = floor(remaining / 24), remainder hours to at most one decimal; preserve zero week/day components and sensible singular/plural. Examples: `0 weeks 0 days 3 hours`, `0 weeks 2 days 3 hours`, `1 week 2 days 4.5 hours`. Do not round to whole days or recompute age from another timestamp.

Null bin: Putaway area `Receiving area`, Bin `No bin assigned`. Staging bin: Putaway area `Inbound staging area`, Bin returned display. Keep distinct lot/status balances even if those hidden dimensions make displayed rows look identical. Do not aggregate their quantities or deduplicate rows.

## Null-bin fallback when bin type is unavailable

Choose the null-bin variant directly when the request explicitly selects NO_BIN, or when existing connection evidence already establishes that bin type is unavailable. Otherwise try the normal packaged query once. If its returned error specifically establishes an unavailable/unsupported Bin table or bin-type field, or denies access only to bin classification while independent InventoryBalance reads remain authorized, use the corresponding null-bin variant once. Never run metadata calls or field probes to decide this fallback. A successful empty result or a generic timeout does not establish unavailable bin type.

| Evidence path | Bin type available | Bin type unavailable or NO_BIN scope |
|---|---|---|
| Receipt-based aging | `putaway_aging` | `putaway_aging_no_bin` |
| Visible balances with age unavailable | `putaway_balances` | `putaway_balances_no_bin` |

Both null-bin queries require `InventoryBalance.binNumber IS NULL`. They do not reference the Bin table or bin-type field, and do not try to infer staging bins from names or other fields. Preserve resolved item/location filters, the original row limit, and aging inputs where applicable. Reuse the known unavailability on the balance-only path; do not try the Bin-dependent query again. Every attempt counts toward the existing 20-read ceiling. Keep the one-response rule and no pagination.

Disclose: `Bin type is unavailable. Only balances with no bin assigned were checked; named staging bins were not evaluated.` If the original request selected INBOUND_STAGING, identify this as an alternative null-bin view, not a completed inbound-staging check. A successful empty fallback supports only no qualifying accessible null-bin balances, never no staging or putaway exceptions across all bins. For an explicit non-null bin filter, the null-bin view cannot satisfy that filter: explain the limitation and ask whether the user wants the unassigned-bin view; do not silently remove the bin filter.

This fallback does not bypass a connection-wide or InventoryBalance access denial. It cannot recover missing receipt history: if aging evidence is also unavailable, use `putaway_balances_no_bin` and mark age unavailable, without claiming an SLA breach. Stop an unsuccessful null-bin path without repeated variants, except for this independently authorized balance-only fallback when receipt evidence is the identified blocker.

## Output

Exact heading: `## Putaway Aging Exceptions`

One row bullets: **Aging duration**, **Items to put away** (returned item and on-hand quantity), **Locations**, **Putaway area**, **Bin**.

Multiple row columns: `Aging duration`, `Items to put away`, `Locations`, `Putaway area`, `Bin`. Preserve executable order: aging start, descending on-hand, location, item, bin. No receipt references, task assignments, or Recommended actions.

No results: `There are no received items awaiting putaway beyond the checked aging threshold.`

Unavailable: `Putaway aging data is unavailable in the current context.`

No-results does not mean all inventory has complete receipt history; the source excludes uncovered balances. Qualify completeness when that distinction matters.

## Balance-only fallback when age is unavailable

When receipt/assignment evidence needed for aging is inaccessible or unsupported but current staging balances remain independently accessible, run the appropriate balance-only query from the selection table once, with the same resolved item/location filters and row limit. Preserve bin/area filters when the normal query supports them; apply the explicit null-bin scope and disclosure rules when using the null-bin variant. Do not retry or bypass the denied receipt source. A connection-wide denial stops all account reads. The fallback has no receipt dependency and does not require an as-of time or SLA to show balances; preserve an already supplied SLA without pretending to test it.

If the normal aging query succeeds with no rows but cannot distinguish below-threshold balances from uncovered receipt history, the same one bounded fallback may show accessible balances. Explain that these balances have not been classified against the aging threshold. Do not infer that all returned balances lack receipt history. Do not run fallback merely to enlarge a capped successful aging result.

Under `### Visible putaway balances — age unavailable`, show Item, On-hand quantity, Location, Putaway area, Bin, and Aging duration. Set Aging duration to `Unavailable` for every fallback row. Preserve source row grain and quantity basis. Use `No bin assigned` only for a null bin; inbound staging must be established by the returned bin classification. Do not guess bin purpose from its name.

State: `These visible balances could not be classified against the aging threshold from the available evidence.` Do not count them as aging exceptions, invent elapsed time, treat unknown age as zero, or use balance creation dates. A successful empty fallback means no matching accessible putaway balances were returned; it does not make a failed aging check successful. If fallback also fails, return the unavailable outcome without rows.

## Explicit guidance only

Explain receipt-layer aging and ask staff to confirm physical receiving/staging position and follow normal putaway procedures. Persistent aging may need the warehouse lead's review. Do not infer task assignments or execute bin movement from this aging explanation alone. A separately requested move requires the shared action contract, exact bin/item/quantity scope and verified warehouse prerequisites.
