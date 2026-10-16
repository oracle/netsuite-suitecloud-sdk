# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Metrics and output

## Metric definitions

| Metric / table label | Returned field | Interval | Standalone output label | Endpoint |
|---|---|---|---|---|
| Picking | `sourceCreationToPickSeconds` | Source transaction creation → Picked | Picking (Source transaction creation to Picked) time | Picked |
| Packing | `pickToPackSeconds` | Picked → Packed | Packing (Picked to Packed) time | Packed |
| Shipping | `packToShipSeconds` | Packed → Shipped | Shipping (Packed to Shipped) time | Shipped |
| Fulfillment lead time | `sourceCreationToShipSeconds` | Source transaction creation → Shipped | Source Transaction Creation to Ship time | Shipped |
| Source creation to pack | `sourceCreationToPackSeconds` | Source transaction creation → Packed | Source Transaction Creation to Pack time | Packed |
| Pick to ship | `pickToShipSeconds` | Picked → Shipped | Pick to Ship time | Shipped |

Only Picking, Packing, and Shipping are non-overlapping steps. Do not add overlapping metrics together. Picking starts at source transaction creation, not fulfillment creation; a long picking interval is not proof of slow physical picking.

## Evidence and assurance

Follow the [account qualification and fallback rules](data-access.md#account-qualification). Distinguish query-returned values for the requested records from independently qualified account semantics. Field metadata, an integrity hash, and successful execution alone do not prove event meaning, timezone alignment, or history completeness.

When those rules allow a bounded named-record fallback without independent qualification, report supported requested values as **query-derived** and add one concise qualification identifying the material unverified assumption. Unresolved semantic contradictions make the affected metrics **Unavailable**, even if numeric durations were returned. A successful sample does not establish account-wide completeness or validate population SLA conclusions.

## Applicability and missing values

Source transactions can be Sales Orders, Transfer Orders, Intercompany Transfer Orders, or Vendor Return Authorizations. One source can have multiple partial fulfillments; analyze each Item Fulfillment separately. The normal sequence is Picked → Packed → Shipped, but records can skip statuses.

Use `statusCode` for checks (`A` = Picked, `B` = Packed, `C` = Shipped) and `statusName` for display. Verify source type using `orderType` and available source-record context. Do not guess an unknown source type.

Apply these rules in order:

1. For Vendor Return Authorization fulfillments, only fulfillment lead time applies. Mark all other metrics **Not applicable** and exclude them from calculations.
2. Subject to the evidence and assurance rules above, a returned nonnegative numeric duration, including zero, is available. Unexpected negative or malformed values are a data error, not a valid duration.
3. If the value is missing and current status has not reached the metric's endpoint, use **Pending**.
4. Otherwise use **Unavailable**, including unknown status or missing evidence after the endpoint. Do not claim a particular step was skipped without evidence.

If source type is unknown and could change applicability, resolve it or mark the affected metric Unavailable. Missing timing data can reflect absent history, a skipped status, a missing source, or chronology rejected by the query; it does not identify a cause.

## Display rules

The current timing query returns `sourceTransactionCreationTimestamp`, `pickedTimestamp`, `packedTimestamp`, and `shippedTimestamp` as text in the fixed format `YYYY-MM-DD HH24:MI:SS`, or null. The aliases are unchanged. Parse these strings as literal calendar and clock values, not as UTC or dates in the host computer's timezone. For example, `2026-09-29 20:11:50` displays as `Tuesday, 29 September 2026, 8:11:50 PM`. Seconds are the supported precision; do not claim fractional-second or timezone-offset precision.

- Keep exact returned seconds for comparisons, thresholds, sums, and averages. Round calculated aggregate durations to the nearest whole second only for display.
- Show at most the two largest nonzero units, using days, hours, minutes, seconds. Spell out units, separate with spaces, and truncate omitted lower units. Example: 90,061 seconds displays as **1 day 1 hour**. Zero displays as **0 seconds**. Never show raw total seconds in a normal business answer.
- Preserve the precision of returned timestamps. When date and time through seconds are present, format as `Sunday, 19 July 2026, 8:42:25 AM`. If only a date is returned, show a readable date followed by `(time not provided)`. If the numeric date format is ambiguous and its locale is unknown, preserve the original string and state that its format is unverified. For other partial timestamps, retain only the supplied components; never invent seconds, midnight, or a timezone. Do not convert an unknown timezone.
- Identify a fulfillment by `tranId`, and a source as `<Source Type> #<source tranId>` when both are verified. Preserve an existing verified display label when those components are unavailable. Use **Unavailable source transaction** or **Unavailable status** if needed.
- Link names only when a verified connector URL or native record reference exists. A plain-text fallback is valid in Claude.
- Hide `resultStatus`, internal IDs, and unrequested technical fields.

## Single fulfillment

For one requested metric, use:

**Fulfillment performance for <fulfillment>**

<Standalone output label>: **<duration | Pending | Not applicable | Unavailable>**

<Fulfillment> is <lowercase status> and was created from <source transaction>.

For a missing value, add the appropriate brief reason after the metric:

- Pending: “The fulfillment has not yet reached <endpoint> status.”
- Not applicable: “This metric does not apply to Item Fulfillments created from <Source Type>.”
- Unavailable: “Required timing data is unavailable.”

For two or more metrics, replace the metric line with a **Fulfillment step timing** table after the status/source sentence. Use `Fulfillment step` and `Duration` columns, only requested metrics, and the user's order. Cells contain only durations or availability labels.

For comparison or bottleneck questions, put the conclusion immediately after the fulfillment heading, before the status/source sentence and table. Use the full step label in prose, such as **Packing (Picked to Packed)**. Do not repeat the table's durations in prose.

If any requested metric is available, end with **Timing details**. List only returned evidence fields associated with available requested metrics, once each, in this order: Source transaction creation, Picked, Packed, Shipped. Use `sourceTransactionCreationTimestamp`, `pickedTimestamp`, `packedTimestamp`, and `shippedTimestamp`. For Picking alone, include only Source transaction creation and Picked; for lead time alone, include only Source transaction creation and Shipped.

For a supplied export or a connector that returns date-only fields, treat them as limited-precision evidence. Label each `(time not provided)` and add once: “The connection returned dates without times; the duration above uses the query's returned seconds.” If this occurred when executing the packaged query, also state that full timestamp retrieval remains incomplete. Do not subtract the dates, infer equal event times, or reconstruct timestamps from a duration. Missing or date-only evidence does not by itself turn an otherwise verified numeric duration into Unavailable. Omit individual null evidence fields; if none are present, use “Detailed timing timestamps were not returned.” Never generate missing dates or times.

## Multiple fulfillments and aggregates

For individual-record results, use one row per fulfillment:

| Item Fulfillment | <requested metric(s), in requested order> | Current Status | Source Transaction |
|---|---|---|---|

Each metric cell contains only a duration or availability label. Return the table without extra narrative unless requested or a material limitation needs disclosure. Aggregate/count questions need a direct answer, not an unsolicited record list. Follow the SLA reference when it specifies a different table.
