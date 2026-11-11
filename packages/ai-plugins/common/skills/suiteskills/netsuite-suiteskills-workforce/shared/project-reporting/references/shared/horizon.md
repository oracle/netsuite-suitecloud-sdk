# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Dynamic dates and project horizon
Coordinated runtime: PM-4.0.0. Distribution release: PM-2026-09-24_v8. Capacity/native component behavior and stamps remain PM-3.0.0.

### Start date

For an unspecified utilization window, calculate the current local date at actual invocation from a trusted current instant and a resolved timezone. Never store a literal current date in runtime instructions.

Resolve timezone from the user’s explicit instruction, otherwise the verified session preference, otherwise an evidenced account/project convention disclosed in the answer. Do not silently assume UTC or the host machine’s timezone. Resolve genuine ambiguity before a definitive date-sensitive answer.

Freeze the as-of instant and timezone once for that run. New runs recalculate “today.” A deliberate refresh across a day boundary creates a new scope/cache signature rather than mixing days.

Preserve source date-only semantics. Do not shift a date-only planned-time entry merely because a timestamp conversion changes the displayed day. Oracle documents different handling of company-level project dates, user-display task timestamps, and planned-time dates. [O5]

### End date: Indicator-first, project-specific, dynamic

For each analyzed project:
1. Attempt an eligible Project Indicator result or its verified supporting context that **explicitly carries or joins the project’s Calculated End Date**.
2. Verify meaning, project identity, evaluation time, requested cutoff, and schedule basis. A generic Indicator deadline, task due date, or coverage scoring-end date is not automatically the project’s Calculated End Date.
3. If no qualified Indicator channel exposes that date, read the verified Calculated End Date on the project record or through a compatible report/search.
4. If that field is inaccessible, use complete task-schedule evidence only where the applicable scheduling method establishes the same calculation. Label the result as a reconstructed schedule bound, not an observed project field or an LLM forecast.
5. If no defensible bound exists, retain the project as unresolved/unavailable for the horizon-dependent conclusion. Do not insert a week, a month, the first task end, or an arbitrary future date.

The Indicator-first preference is a requested suite policy. Neither the attachment nor the reviewed public Indicator descriptions establishes a universal Indicator field for the project’s Calculated End Date. Oracle documents that date on the project record for forward scheduling; backward scheduling has different date semantics. [A1, O3, O4]

For portfolio resource calculations, use the latest validated project end across the scoped set as the common retrieval bound, while retaining every project’s own end, source, timezone/date basis, and unresolved state. Do not silently omit unknown-end projects and call the resulting maximum complete.

Keep the requested analysis end and the calendar-materialization/evidence end separate. Missing capacity beyond a materialized window limits the analysis; it does not authorize shortening the requested horizon.

If unfinished work has a calculated end before today, flag the overdue schedule or absent forward plan. Do not manufacture a positive future window or conclude no remaining demand.

Check for `plannedwork` recorded after the selected project end. Report the discrepancy and retain relevant evidence; do not silently extend or truncate the authoritative date. An explicitly requested longer window is permitted and must be labeled.

An explicitly provided utilization window overrides this default. Historical utilization must be explicitly requested. The future default does **not** suppress overdue-task, approval-aging, actual-overrun, or financial-history evidence needed for different risk checks; give those checks their own applicable evidence windows.
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
