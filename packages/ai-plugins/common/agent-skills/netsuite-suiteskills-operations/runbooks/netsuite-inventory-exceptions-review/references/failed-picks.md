# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Pick task failures

## Query and meaning

Run `failed_pick_tasks` when asked about failed picks, including “what should I do?” unless the user explicitly asks for guidance without checking records. Do not return only help links for a current-record request.

Use PickTask JOIN PickAction and LEFT JOIN PickActionInventoryDetail with failed action status. One returned action/detail row remains one failure row. The inherited query does not project the detail ID, so do not deduplicate by pickActionId or by visible columns: identical-looking rows may represent separate details. Do not use PickTaskInventoryBalance or other availability joins; those multiply failures across unrelated bins.

Use action-detail bin and the first non-null of detailInventoryNumber and taskInventoryNumber. Do not substitute staging, recommended, or alternate inventory bins. Failure details is only returned failureReason. The dedicated action source does not return a message; do not manufacture one. Do not infer retry, match, override, delete, alternate stock or action availability from any returned flag.

For non-null relatedTransaction IDs use `transaction_refs`, preserving generic transaction identity; do not assume SalesOrder. Optional label/UI-link enrichments use exact returned IDs separately for Wave, Item, Bin, InventoryNumber and Employee. Resolve each type independently using demonstrated typed reads and the remaining read budget. One failed type must not discard other successful labels. Do not query Location or Units merely for output; they are not columns.

Do not treat numeric relation values as names or URLs. The source's `pickTaskUrl` is a constructed relative route, not a connector-verified absolute UI link. In this Claude edition display the returned pickTaskNumber in plain text unless the exact UI URL is independently verified. For multiple rows, always use plain pickTaskNumber. Never guess the account host or generate another route.

Null picker in bullets is `No assigned picker`; an unresolved non-null picker is `Reference unavailable`. A missing optional relation stays blank in a table. Preserve primary rows if enrichment fails, with one concise limitation. Reference lookups must not consume the budget needed for the primary result.

## Output

Exact heading: `## Pick Task Failure Exceptions`

One row bullets in order: **Pick task**, **Related transactions** (transaction and wave), **Picker/Operator**, **Pick task line item** (item, action bin, lot/serial), **Failure details**, **Recommended actions**.

Multiple row columns: `Pick task`, `Related transaction`, `Wave`, `Picker/Operator`, `Item`, `Bin`, `Lot/Serial`, `Failure details`. Keep the distinct reference fields in separate cells and one row per returned failure. The generic Related transaction label is the observed internal ID; optional verified URL makes it clickable. Add one Recommended actions section immediately after the table; no separate pick-task-links section.

No results: `No failed pick tasks were found for the checked criteria.`

Unavailable: `Pick task failure data is unavailable in the current context.`

## Recommended actions

Use exactly these three links for successful output and explicit guidance-only requests. Do not append generic corrective guidance.

- [Viewing and Handling Fulfillment Generation Failures](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0305030933.html)
- [Troubleshooting Common Order Sync Errors in NetSuite Connector](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_164017180964.html)
- [Viewing, Updating, or Deleting Pick Tasks](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1548082148.html)
