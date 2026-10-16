# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# SLA analysis

Use for SLA summaries, compliance, breach lists, deviations, and rankings without population recommendations. Apply the main skill and metric rules.

## Calculate

1. Use the requested metric, defaulting to fulfillment lead time. Obtain a supplied/context SLA before retrieval; validate its units and convert it to exact seconds. A negative or ambiguous target requires clarification.
2. For fulfillment lead time, select only currently Shipped fulfillments. For any other SLA metric, do not restrict current status. Do not restrict source types.
3. Include a fulfillment in the SLA denominator only if the selected metric applies and has an available duration. Exclude Pending, Unavailable, and Not applicable values.
4. A breach is `duration > SLA`; equality meets the SLA. Calculate eligible count, breach count, and breach percentage from the complete eligible population. Round only the displayed percentage to the nearest whole percent.
5. For each breached record, calculate `time over SLA = duration − SLA` using exact seconds.
6. Show all breaches unless prioritization/ranking is requested. Then sort by time over SLA descending and show three unless the user specifies another count. Use fulfillment ID as a stable secondary key. Compute counts and status before display limits.

## Answer

Start with **SLA performance**. Express the target as a readable adjective, such as “4-hour SLA.” Use appropriate singular/plural grammar.

| Result | Required answer after the heading |
|---|---|
| No eligible records | `SLA status: **Not available**` followed by “No eligible Item Fulfillments were found for SLA analysis.” No table. |
| No breaches | `SLA status: **Met**` followed by “All <eligible count> eligible Item Fulfillments met the <target> SLA.” For one record, say “The eligible Item Fulfillment met …”. No table. |
| At least one breach | `SLA status: **<rounded percentage>% of eligible fulfillments (<breached count> out of <eligible count>) exceeded the <target> SLA.**` Then show the table below, even for one breach. |

| Fulfillment | <SLA metric label> | Time over SLA | Status | Source Transaction |
|---|---:|---:|---|---|

Use human-readable durations, lowercase statuses, and verified links when available. Do not add contributor analysis, recommendations, raw seconds, compliance-rate columns, or a scope block unless requested. Disclose any material exclusions or limitations briefly; an unavailable/failed retrieval is not the no-eligible-records outcome.
