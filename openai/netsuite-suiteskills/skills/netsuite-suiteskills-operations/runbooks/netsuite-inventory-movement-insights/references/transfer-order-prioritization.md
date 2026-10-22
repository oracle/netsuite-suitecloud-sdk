# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Existing transfer-order priorities

Recommend or rank **existing open transfer orders** for one item from one source location. Require both inputs and resolve ambiguity before querying. Read [shortage analysis](shortage-analysis.md) and [retrieval and tools](retrieval-and-tools.md).

**Account evidence:** Follow [account validation](account-validation.md) for both packaged queries. Preserve `TransferOrder.status` and its filters: `B,D,E` for Open Transfer Candidates and `B,D,E,F` for Incoming Supply. Check or reuse relevant metadata and representative transfer reconciliation covering status eligibility, source/destination, and remaining fulfillment/receipt quantities. Unexplained omissions permit bounded validation. Actual restrictions, query failures, incomplete inputs, or material validation gaps prevent a definitive transfer priority. Do not rename the field or remove its filters.

## Workflow

1. Run `queries/open_transfer_orders.sql` with the item ID and source location ID. Require a complete result with `transferOrder`, `transferOrderId`, `destinationLocation`, and `destinationLocationId`. The query selects eligible open lines with quantity still to fulfill. It does not calculate shipping capacity.
2. If a complete candidate query with applicable validation returns no rows, say no matching open transfer orders were found for the item from the source within the requested scope. If comparison evidence is missing, qualify an empty result under account validation. If retrieval fails or truncates, say priority could not be determined; do not use the no-match response.
3. Collect distinct destination IDs from the candidates and intersect them with any user-specified destination filter. If none remain, give the no-match response. If any candidate lacks a usable destination ID, do not silently drop it and claim a complete ranking.
4. Calculate Open Demand, On-hand Supply, Incoming Supply, Total Supply, and Shortage for every retained destination. If any required destination metric is incomplete or materially unverified, withhold an overall recommendation/ranking and state the coverage or validation limit.
5. Keep destinations with `shortage > 0`. If there are none, say matching orders exist but none of their destinations currently shows a Shortage under this definition.
6. Rank destinations by Shortage descending. Equal shortages share the same priority. Use dense ranks such as 1, 1, 2. A recommendation keeps only the highest destination(s); a priority-order request keeps all qualifying destinations.
7. Filter the original candidates locally by retained **destination IDs**, deduplicate `(transferOrderId, destinationLocationId)`, and attach the destination metrics. Return every matching order for the retained destinations. Orders to the same destination have the same priority. A stable display order within ties is for readability, not a claim that one tied order is preferable.

Incoming Supply already includes eligible unreceived transfer quantities, including candidate orders. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.

## Response

Start with the direct recommendation or priority conclusion; omit the general skill heading.

- **One order:** identify its document number, source, and destination; explain the destination shortage; list Total Supply, Open Demand, and Shortage in units.
- **Several recommended orders:** explain the highest destination or tied destinations, then use `Transfer Order | Destination | Total Supply | Open Demand | Shortage`.
- **Several ranked orders:** use `Priority | Transfer Order | Destination | Total Supply | Open Demand | Shortage`. Explain that priority is shared for equal destination shortages.
- Use verified record links only when supplied by the connector; otherwise show document numbers and location names as text. Do not invent special record-reference markup.

Finish with the shortage scope note. Add that this ranks destination quantity gaps, not source availability, transfer quantities, shipping dates, or fulfillment feasibility. A ranking is not a transfer instruction. For requested changes, follow the shared action contract: establish exact scope, authorization, supported capability and business prerequisites, then verify the outcome.
