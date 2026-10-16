# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Indicator definitions and unresolved source boundaries
Runtime contract: PM-3.0.0. Distribution release: PM-2026-09-23_v7.

Use the sanitized feature definitions [A1], channel-specific developer
reference [A3], and assignment-grain investigation lessons [A2]. Originals with
account or internal collaboration material are not distributed. Sanitization does
not promote draft behavior to a verified current implementation. Resolve native
types and enum values at runtime; preserve differing definitions and limitations.

Where the supplied rule is complete and the user requests its calculation, show a **specification-derived** result with inputs and provenance. It remains separate from a native status. Where a required definition is ambiguous, report supported facts and the exact blocked computation.

### Planned vs. Actual Time Overrun

Supplied definition: same project task, resource, and day; Planned Work feature required; exclude parent/summary tasks. Percentage is `(actual - planned) / planned × 100`. Green means no actual-over-planned tasks; Yellow is 1–10%; Red is above 10%. [A1]

Read the runtime-resolved native planned/actual overrun type first; retain its color/message/freshness without substituting raw totals. For explanation or a specification-derived calculation, use validated planned/actual dated detail at the documented grain. Aggregate each side before joining to prevent multiplication. Preserve the backend's `timebill.resourceallocation` diagnostic link without treating it as ordinary utilization demand. Do not use whole-project totals to color one resource/day. [A3]

Open definitions: the text leaves positive overruns below 1% unspecified unless a rounding policy exists; zero planned hours makes the ratio undefined; actual-time approval inclusion is not fully defined. Preserve native observations and raw differences without inventing those rules.

### Overdue Tasks

Supplied definition: incomplete non-summary tasks; use Finish No Later Than when present, otherwise End Date for the inclusion predicate. Overdue proportion is days overdue divided by planned duration; points are 1 at ≤10%, 2 at >10% and ≤25%, and 3 above25%. Totals below3 are Green, 3–5 Yellow, and above5 Red. [A1]

Open definitions:
- The inclusion predicate uses Finish No Later Than, but the listed days-overdue column uses `today - End Date`. Do not silently unify them.
- One or two overdue points can still be Green, although the supplied Green message says no overdue tasks. A Green observation is therefore not proof of zero overdue tasks.
- Clarify original/baseline versus current duration, working versus calendar days, inclusivity, and zero/nonpositive duration before reproducing a score.
- A zero-work milestone may require a separate schedule/milestone check even when excluded from an executable-task calculation.

Return supported overdue facts using a clearly named date basis while the disputed native-score reconstruction remains unverified.

### Project Resource Coverage for Remaining Work

Supplied definition: assigned resources’ available hours before effective task due date compared with remaining planned work; non-summary tasks; Planned Work required; tasks due before the evaluation day are excluded and assessed elsewhere. Other projects/tasks’ planned time reduces available hours. [A1]

Supplied thresholds: Green at sufficient coverage; Yellow at 90–99%; Red below90%. Do not silently close the continuous-value interval between99% and100% unless precision/rounding is validated. A proposed interpretation of 90%≤coverage<100% must be labeled as a proposed clarification, not the literal source.

Read the runtime-resolved native remaining-work coverage type first, then the source-backed coverage drill-down; do not replace it with `plannedwork-and-native-risk.md`.3's planned-utilization calculation. Retain `missinghours` and its mapped assignment/window. Zero available with positive required hours yields 0% coverage when the operands' definition and grain are compatible; zero remaining hours has no positive ratio denominator. An independently computed ratio is not the native color. Preserve the backend's diagnostic allocation and remaining-work fields under the risk pathway only. [A2, A3]

The attachment's developer question about approved time off remains preserved. Oracle's 2026.2 description explicitly includes approved time off, and the new backend reference lists it among debug inputs; this supports the documented product intent. It does not establish whether a particular exposed available-hours value has already deducted leave. Verify that before deductions; never subtract approved leave or blocked hours twice. [A1, A3, O3]

Calendar materialization can be finite; verify evidence coverage through the chosen horizon. [A1]

### Project Margin Indicator (Cost vs. Revenue)

Supplied definition: `(recognized actual revenue - actual project cost) / recognized actual revenue`. Green above10%, Yellow 0–10%, Red below0%. The supplied feature prerequisites are Job Costing and Project Budgeting, or Advanced Project Profitability. [A1]

Use compatible project, accounting period/book, currency, actual recognized revenue, and complete costs. Do not replace revenue with invoices or cash.

Preserve the supplied special cases: observed zero revenue and zero cost maps to Green under that profile; zero revenue with positive cost maps to Red without dividing. The numerical margin remains undefined at zero revenue. An empty/inaccessible report is not an observed 0/0. Do not present the 0/0 Green as proof of profitability.

### Unbilled Approved Charges

The attachment calls this “Actual charges have not been invoiced”; current release notes call the new Indicator “Unbilled Approved Charges.” Validate runtime type identity rather than assuming a name or negative ID proves equivalence. [A1, O3]

Supplied thresholds: no qualifying unbilled approved charge older than14 days is Green; at least one older than14 is Yellow; at least one older than30 is Red. Red takes precedence. Exactly14 and exactly30 require strict-boundary handling; do not silently use ≥.

Resolve actual/approved/unbilled status and invoice/application links from current schema. Do not include forecast charges.

Open definition: the original attachment does not fully specify the aging clock's start. The new backend identifies `chargedate` as a debug field but does not explicitly establish it as the engine's aging clock; preserve it, do not silently equate it with approval or eligibility time. `READY_FOR_BILLING` plus absent invoice/transaction links is a probe condition, not by itself proof of a >30-day breach. Preserve the native unbilled-charge type independently from margin and expense approvals. A Green result does not mean every charge is invoiced; newer unbilled charges may remain. [A1, A3]

### Additional Indicators and non-Indicator risks

Discover all runtime types and the complete local analytical register,
including approval/time-capture and imported-expense types when returned. Generic
concept labels are not a scan filter or denominator. Historical account counts,
IDs, personnel and results are excluded from technical provenance. Keep native
coverage diagnostic inputs distinct from ordinary plannedwork capacity; do not
restore stored-risk-register or Business Metrics assumptions.

For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Retain the overlap at five as a documentation ambiguity when reconstructing that legacy rule; the actual native status can still be reported. Do not silently choose a boundary or apply legacy prior-week thresholds to another deployed version. [O8]
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
