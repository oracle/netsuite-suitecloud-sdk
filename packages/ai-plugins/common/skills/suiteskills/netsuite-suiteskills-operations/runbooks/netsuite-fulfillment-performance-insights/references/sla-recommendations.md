# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# SLA recommendations

Use for operational recommendations or contributor explanations across a population, not named-record bottlenecks or SLA-only breach lists. Apply the main skill and metric rules. Give fixed actions only when the user asks for recommendations or improvements. For a why-only request, report the supported contributor pattern without actions or a claimed cause.

## Select and assess

1. Use fulfillment lead time as the SLA metric. Obtain the SLA before retrieval. If the user requests recommendations against another metric, clarify whether to use lead time; do not silently substitute.
2. Include only currently Shipped fulfillments created from Sales Orders, Transfer Orders, or Intercompany Transfer Orders. Exclude Vendor Return Authorizations everywhere in this workflow. Verify the account's intercompany mapping before using the query's `SalesOrd`/`TrnfrOrd` source filter.
3. Preserve the source rule: the SLA denominator is **all returned fulfillments in this eligible population**, before any step-completeness filter. If any of these rows has missing/invalid lead time, stop this assessment and explain that SLA status cannot be determined for the complete population. Do not count unknowns as compliant, silently drop them, or change the denominator. Ask for the intended missing-value policy if needed.
4. Count breaches where `sourceCreationToShipSeconds > SLA`. Equality meets the SLA. Calculate the breach percentage with exact counts, rounding only the displayed percentage to a whole percent. If there are no eligible rows or no breaches, use the corresponding outcome below and stop.

## Identify contributing steps

1. Compute three independent averages from **all available values across the entire eligible population**, including breached and non-breached records:
   - Picking: `sourceCreationToPickSeconds`.
   - Packing: `pickToPackSeconds`.
   - Shipping: `packToShipSeconds`.
2. Include a record in a step's average even when its other step values are missing. Never replace missing values with zero.
3. Form the contributor cohort from breached records with **all three** step values available. Keep incomplete-step records in the SLA denominator and any baseline they support. Do not disclose cohort size unless the user asks for methodology.
4. For each complete breached record, increment a step's count only when its duration is **strictly greater** than that step's unrounded average. A record may contribute to several counts. Equality does not increment a count.
5. Compare raw counts. Do not normalize counts or choose the step with the longest duration or largest average. These counts indicate a timing pattern, not a proven cause.

## Choose the answer

Evaluate the following outcomes in order. Use only the first match.

| Outcome | Required content |
|---|---|
| No eligible fulfillments | `SLA status: **Not available**`; “No eligible Item Fulfillments were found for SLA analysis.”; “No fulfillment step recommendation is available.” |
| Zero breaches | `SLA status: **Met**`; all eligible fulfillments met the target, with the count; “No fulfillment step recommendation is available because no SLA breaches were found.” |
| No complete contributor cohort | Breach status, then contribution heading; “A primary delayed fulfillment step could not be identified because complete picking, packing, and shipping timing data is unavailable for the SLA-breached fulfillments.” No recommendations. |
| All counts are zero | Breach status, then contribution heading; “No primary delayed fulfillment step was identified. None of the supported fulfillment steps exceeded its corresponding baseline in the SLA-breached fulfillments.” No recommendations. |
| Three-way tie above zero | Breach status, then contribution heading; “No single fulfillment step is the primary contributor. Picking, Packing, and Shipping have the same above-average fulfillment count.” No recommendations; equal counts do not prove equal delay durations. |
| Two steps tie for highest | Breach status, contribution heading, `Primary delayed fulfillment steps: **<step 1>** and **<step 2>**`, contributor table, brief explanation, and both fixed action sets in lifecycle order when recommendations are requested. |
| One step has highest count | Breach status, contribution heading, `Primary delayed fulfillment step: **<step>**`, contributor table, brief explanation, and that step's fixed action set when recommendations are requested. |

For outcomes with breaches, start with:

`SLA status: **<rounded percentage>% of eligible fulfillments (<breached count> out of <eligible count>) exceeded the <target> SLA.**`

Then use the heading **Fulfillment step contribution analysis**. In the three non-recommendation breach outcomes, add “No fulfillment step recommendation is available.” Omit contributor tables except for a one-step winner or two-step tie.

For a winner or two-step tie, show all three rows:

| Fulfillment step | Fulfillments exceeding the average duration |
|---|---:|
| Picking | <count> |
| Packing | <count> |
| Shipping | <count> |

Explain that the selected step(s) exceeded their corresponding baseline in the highest number of SLA-breached fulfillments. Use full step labels in this explanation: Picking (Source transaction creation to Picked), Packing (Picked to Packed), Shipping (Packed to Shipped).

## Fixed recommended actions

When recommendations are requested, use **Recommended actions** as the heading. Present the winning step's three actions as separate bullets, ending each with a period. For a two-step tie, use `For picking:`, `For packing:`, or `For shipping:` above each relevant set, in lifecycle order. Do not add or merge actions or describe them as proven causes.

| Step | Three actions |
|---|---|
| Picking | Review picker workload during peak periods. / Prioritize aging and high-line-count fulfillments earlier in the picking queue. / Rebalance picking resources across warehouse zones. |
| Packing | Review packing queue capacity during peak periods. / Ensure adequate packing station staffing and materials. / Prioritize fulfillments waiting longest after picking. |
| Shipping | Review shipping handoff and carrier pickup schedules. / Prioritize fulfillments approaching the SLA before carrier cutoff. / Investigate shipping queue delays and dock capacity. |

## Closing scope statement

End every completed recommendation outcome with:

**Scope and data limitations**

This analysis includes eligible shipped Item Fulfillments created from Sales Orders and Transfer Orders, including Intercompany Transfer Orders. Vendor Return Authorizations are excluded. Step averages use each available step value; contributor counts use only breached fulfillments with complete picking, packing, and shipping timing data.

Do not add content after this block. Omit individual fulfillment details, raw durations, extra statistics, and methodology unless requested. A blocked assessment is not a completed outcome: explain its actual limitation without implying the analysis ran successfully.
