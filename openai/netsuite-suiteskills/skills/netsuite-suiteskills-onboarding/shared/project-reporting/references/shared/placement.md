# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Same-role employee placement
Coordinated runtime: PM-4.0.0. Distribution release: PM-2026-09-24_v8. Capacity/native component behavior and stamps remain PM-3.0.0.

Default placement searches to **employee Project Resources with the same recorded role**.

Resolve the target role from the recorded work requirement, or from the exact replaced employee when the request is explicitly “same role as this employee.” Match verified role identifiers and applicable effective dates. Do not use a similar title, free-text skills, role seniority, fuzzy labels, reputation, or a security role as a substitute.

A candidate must have applicable employee/Project Resource eligibility and sufficient verified date-matched `plannedwork`-based free capacity. Generic, inactive, and eligibility-unknown resources are not confirmed eligible.

Do not broaden to vendors/contractors, different roles, or approximate role equivalence unless the user explicitly requests it. No same-role match means no confirmed same-role employee candidate; it does not mean no resources exist.

This candidate filter does not exclude vendors or other resource types from portfolio population reconciliation, existing-work analysis, or risk coverage.

Display useful, permitted candidate facts: name, exact recorded role, date window, planned hours, net calendar capacity, spare hours, supported shortfall, source freshness, and limitations. Comparable price may be displayed when available and appropriate, with currency/unit/effective date. **Displaying price does not authorize price-based selection, ordering, exclusion, or tie-breaking.** Do not retrieve unrelated salary or sensitive HR details.

Use price to filter or rank only when the user explicitly requests a price constraint or ranking. Unknown price is not zero. Without such a request, missing price does not disqualify a role/capacity match.

If no ranking preference is specified, present qualifying candidates in a neutral stable order with their capacity facts. Do not spend the same free hours on several proposed placements; track scenario commitments separately without writing Resource Allocation records.

Keep pipeline work identifiable as tentative. Use recorded inclusion criteria; do not invent win probabilities or probability-weighted work. Quantified capacity effects require `plannedwork`. Missing dated planned work remains an evidence gap.
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
