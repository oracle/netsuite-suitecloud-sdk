# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Plannedwork and native-risk evidence modes
Runtime contract: PM-4.0.0. Distribution release: PM-2026-09-24_v8.

### 4.1 Intent and source decision

Choose the analysis pathway from the requested meaning, not just the word “capacity.” A combined request can require both pathways; retain separate evidence, calculations, windows, and conclusions.

| Pathway | First authoritative evidence | Permitted supporting evidence | Required distinction |
|---|---|---|---|
| Staffing feasibility, remaining-work, or resource-coverage risk | Native **Project Resource Coverage for Remaining Work** in `projectindicator`; runtime-verified coverage-type mapping. | Native drill-down and verified `projecttasktimeremainingrisk`; tasks/assignments, remaining/planned work, calendars, leave, time or allocation inputs where the native definition or explanation requires them. | Native risk state is not an ordinary planned-utilization percentage. |
| Broad risk/health review | All applicable native Project Indicators, explicitly including remaining-work coverage, followed by the complete scoped evidence-led investigation. | The mapped inputs for each Indicator and all other required risk families. | Do not stop after one coverage type, known concept labels, or a non-green list. |
| Ordinary utilization, availability, bench time, staffing distribution, or replacement-candidate capacity | Validated `plannedwork` quantities and their verified date/resource decomposition, with compatible calendar/leave capacity. | Task assignments for ownership/role and verified dates; not allocation demand. | Resource Allocation records and allocated work do not supply or reduce ordinary utilization/availability. |

For a substantive ordinary-utilization analysis, the scope-appropriate native-first investigation occurs under `risk-discovery.md`. Its native observations accompany—but do not rewrite—the independent `plannedwork` calculation. Fetch Indicator evidence before derived risk calculations; a failed optional drill-down must not erase a native result already read successfully.

### 4.2 Native remaining-work risk first

For staffing or remaining-work risk, first read the exact project's eligible native coverage result, using the exact runtime-resolved coverage type after validating identity. Preserve its actual status, severity, message, action requirement, recommendation, deadline, and freshness. Read the remaining native types in the same inventory or subsequent complete retrieval.

Do not calculate ordinary `plannedwork` utilization first and present it as the Indicator. Do not ignore a native warning because planned utilization is below 100%, or because explaining the native warning uses `remainingwork`, `allocatedwork`, or `resourceallocation` rather than only `plannedwork`.

Use the native result as authoritative for **what NetSuite displayed/calculated at that observed result state**. It does not establish that the source records have not changed since evaluation or that the native status covers every staffing issue. Preserve those time and scope distinctions.

Investigate the native drill-down next. Prefer the verified `projecttasktimeremainingrisk` output to independently recreating the native calculation. Use `missinghours` to quantify the returned gap at its true assignment/window grain. Missing-hour evidence may remain usable even where a task-level `plannedwork` total is hidden; disclose its actual source.

Allow `resourceallocation`, `allocatedwork`, `timebill.resourceallocation`, and other supplied backend inputs **for native-risk explanation or a specifically validated risk fallback**, when relevant and authorized. Their appearance in a debug probe is not proof of an additive formula. Do not add project/task allocation percentages, infer 180% utilization, or reconstruct a native color from them without the corresponding verified native rule, scope, and denominator.

If the native result cannot be read after alternatives, mark native status unavailable, not Green. Continue the supporting dataset and mapped raw-evidence analysis for every scoped project. A numeric gap or other supported finding is a **derived/raw coverage finding**, not an observed native Indicator color. A risk fallback needs its own validated definition; ordinary planned-utilization math is not a silent equivalent.

If native coverage and an independent utilization view disagree, preserve both with their sources, dates and definitions. Investigate granularity, remaining-work versus planned-hours meaning, calendars/leave, source changes and freshness before claiming a cause or overriding either view.

Oracle describes this native Indicator as a remaining-work feasibility check considering other assignments and approved time off. The supplied backend scan names additional debug inputs; the existence of those inputs does not by itself publish their internal formula. [A1, A2, A3, O3]

### 4.3 Ordinary utilization uses only `plannedwork`

Use **`plannedwork` as the sole authoritative planning quantity** for ordinary utilization, availability, bench analysis, staffing-distribution totals, and placement-candidate capacity. This is a scoped measure definition, not a blanket restriction on native risk evidence.

Do not use Resource Allocation records, allocated work, reservations expressed as allocations, allocation percentages, or their derived utilization as demand, as capacity deductions, or as a substitute when `plannedwork` is unavailable. Do not substitute estimated work, calculated work, actual work, or an unverified report's “planned” label.

The official Records Browser documents `plannedwork` as a project-task total and an assignee field; that does not establish an independently exposed record/table or a daily distribution. Verify the actual account/channel schema. [O2]

Use a report, saved search, dataset, record field, or query only if its ordinary planning values are traced to the same validated `plannedwork` definition. Native dated planned-time detail may supply the **temporal decomposition** of that quantity only where its lineage, units, task/resource/date links, and reconciliation are verified. It is not an additional numerator to add to totals.

If only task/project totals exist, report those totals at their actual grain. Do not invent daily effort, spread totals evenly, copy a task total to every assignee, or generate future planned work by subtracting actuals from a lifetime total. Daily utilization remains unavailable until dated distribution is validated.

Distinguish task assignments from Resource Allocation records. Assignments remain needed for ownership, exact resource links, recorded role requirements, eligibility, and assignment-level `plannedwork`.

Build a resource-by-source-local-workday ledger. Normalize durations and units; deduplicate row identities; reconcile assignee/leaf-task/project rollups without summing parent and child totals.

For a resource/day:
- `planned_hours` = validated date-matched `plannedwork` decomposition;
- `net_capacity_hours` = validated calendar capacity less compatible, nonduplicated holidays, approved leave, and other evidenced non-allocation reductions;
- `planned_utilization_pct` = `100 × planned_hours / net_capacity_hours`, only with a valid positive denominator;
- `capacity_balance_hours` = `net_capacity_hours - planned_hours`;
- `spare_hours` = positive capacity balance; report excess demand separately when balance is negative.

Do not deduct planned work from the utilization denominator and also use it in the numerator. Apply source-configured capacity factors only once and disclose their basis. Do not assume a standard workweek or utilization target.

A zero-capacity day with positive planned work is a supported scheduling/capacity conflict, but its percentage is undefined. Missing capacity differs from verified zero. If commitments are incompletely visible, distinguish confirmed overload on known demand from any unsupported claim of total free capacity.

Report daily conflicts before aggregation. A period average below 100% does not erase an overloaded day. Preserve positive/negative balances rather than offsetting a placement-time conflict with spare hours on an unusable date.

**Actual-time scope:** Actual time remains necessary for native overrun explanations, missing-time, historical effort, and financial evidence. It never becomes future ordinary planning demand or an additional future-utilization numerator.
## Source key
[A1]: ../sources/project-indicators-feature-spec.md
[A2]: ../sources/project-risk-review-investigation.md
[A3]: project-indicators-backend-developer-reference.md
[O1]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1530301667.html
[O2]: https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2025_2/script/record/projecttask.html
[O3]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_3715561461.html
[O4]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_3740077129.html
[O5]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1201840.html
[O6]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1189731.html
[O7]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158618649135.html
[O8]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N1179876.html
[O9]: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_160276344912.html
