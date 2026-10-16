# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Present inventory balances in the host

Use native Markdown tables. For larger results, use a the host artifact or downloadable table only if available and useful; otherwise provide a bounded inline preview. Do not require a proprietary canvas, finalizer, generated UI-table object, or host-specific response envelope. Never lose rows silently because an artifact tool is unavailable. Keep all displayed quantities traceable to the retrieved evidence.

## Supported answers

Start with "Here are the current inventory balances for <request>:". For many criteria, use "Here are the current inventory balances for the specified items:". Use a short table/artifact title when that surface supports one, such as "List of BinItem by bin at WMS Warehouse 1". Use exact returned names for singular dimensions; common nouns or counts for multiple records. Do not duplicate a title as a separate pre-table paragraph.

- For five or fewer final rows, show the table inline, including requests for totals.
- For more than five rows or an explicit report/breakdown request, prefer an artifact or file if available. Keep supporting chat brief and do not duplicate the detailed table. Otherwise show a bounded Markdown preview and state its displayed row count.
- Include `Item`, the requested storage dimension(s), `On hand`, `Available`, and `Unit` when known. For item-only totals, omit unrequested location/bin columns. If the user asks only for on-hand quantity, include available only when helpful.
- Keep labels distinct from internal IDs. If labels are unavailable, show labeled IDs and note the limitation. Do not invent record links.
- Show explicit zeros exactly when evidence supports them. Show unavailable quantities as `Unavailable`, not `0`.
- Display only item/location/bin breakdowns. Lot/serial, inventory-status, license-plate, and other lower-dimension breakdowns are unsupported, including when explicitly requested. Do not imply inventory-status balance interpretation is supported.
- When no rows are returned, omit the table or leave it empty; use the specific limitation from the connection reference. Never create a quantity placeholder with zeros.

After the table, include a concise visible **Summary** with the useful details below. For an artifact, place the table first and the summary immediately after it. Omit irrelevant dimensions rather than making up values.

- **Scope:** exact name for a single item/location/bin, counts for multiple returned records, and any additional filters. Keep requested versus successfully returned scopes distinguishable.
- **Unit:** primary stock unit when confirmed; otherwise the returned basis and the missing-conversion limitation. For multiple items with different stock units, retain each row's unit rather than implying one shared unit.
- **Rows displayed:** shown/total when the total is known, or "N shown; total unknown". Distinguish retrieved detail rows, final aggregated rows, and displayed preview rows; do not divide an aggregated-row count by a raw-detail total as if they were the same population.
- **Source/reference and retrieval time:** include actual source/report/record links and time only when available. Do not fabricate links or freshness.
- **Limitations:** identify limited/truncated/permission-filtered/incomplete evidence, unavailable labels, unavailable stock-unit metadata, failed or empty scopes, or other material limits. If none were reported, say "None reported by the returned evidence" rather than promising unrestricted completeness.

If the returned metadata reports more than 500 total rows, label the displayed rows a bounded preview in both supporting chat and the summary. Direct the user to the exact report name **Current Inventory Snapshot** for complete results and per-item totals, linking it only when a real report link is available. If the connector does not establish that this report is available in the account, phrase it as "Use your account's Current Inventory Snapshot report, if available, for complete results and per-item totals." Do not retrieve report data to replace missing balance evidence. For 500 or fewer rows, include a report/source link only when a real one is returned or supplied.

Do not say "all" unless returned evidence proves completeness. For limited results, label quantities as **returned-rows quantities only**; if an already-aggregated response explicitly certifies complete group totals, state that separate completeness basis precisely. Do not add metric cards, computed count blocks, or follow-up options unless requested or needed to resolve an ambiguity.

## Unsupported answers

Use a concise explanation:

> This skill does not support the requested balance interpretation yet.
>
> Supported view: current on-hand and available quantities by item, location, or bin.
>
> Limitation: unsupported balance type.

For unavailable/failed evidence, use the actual failure meaning instead of an unsupported-balance message. Never imply that no access means no stock.
