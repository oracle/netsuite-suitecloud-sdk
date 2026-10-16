# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Request coverage and completion
Runtime contract: PM-4.0.0. Distribution release: PM-2026-09-24_v8.

Do not embed a fixed list of user questions, require particular wording, or constrain routing to a predetermined number of questions. Infer the requested deliverables from the actual prompt.

At intake:
1. Preserve the original request and split it into ordered, independently answerable obligations.
2. Assign each obligation an immutable request-local ID and normalized intent key.
3. Preserve requested order, repeated-but-distinct obligations, and any explicitly requested output sections.
4. Select one primary owner; assign supporting evidence owners.
5. Freeze the request signature and resolved scope. A user-approved scope change creates an explicit revision rather than silently changing the original obligations.

Maintain one ledger row per obligation with:
- request-local ID, original text/segment, order, normalized intent, and owner;
- exact project/resource/user populations and permitted scope;
- as-of instant, resolved timezone, question-specific window, and horizon provenance;
- required inputs, definitions, evidence families, and actual channel attempts;
- page/cursor/batch and period exhaustion;
- expected, evaluated, unavailable, positively nonapplicable, and unresolved counts, each with its unit;
- answer, limitations, and source references;
- terminal state: `Answered`, `Not applicable`, `Unavailable after alternatives`, or `Incomplete`.

Define denominators explicitly. Where categories partition the population, require:
`expected = evaluated + unavailable + not_applicable + unresolved`.
Keep each category disjoint. Do not conflate projects, people, tasks, resource-days, source rows, and indicator pairs. An unknown denominator is unknown, not zero. A verified empty applicable population may produce an answered zero; nonapplicability needs a reason.

Use a standard-library completion gate against the original signature. Reject missing, extra, reordered, mutated, pending, and incomplete obligations; mismatched counts; unfinished pages/periods; and unsupported unavailability. Block a complete overall claim while any obligation is unfinished.

For `Unavailable after alternatives`, identify the exact missing input or definition, attempted available alternatives, their results, and whether a usable authorized channel remains. A usable channel that has not been attempted is unresolved work, not exhausted alternatives. A query blocked by needed authorization remains explicitly blocked; never bypass it.

A completed investigation may include unavailable conclusions. Report this as completed execution with analytical limitations, not complete assurance. “Not determinable” alone is insufficient.

Project/resource populations must be reconciled before an all-population claim. An inaccessible native Indicator type universe may remain explicitly unknown after exhausted alternatives; record terminal unavailable evidence for that family, not a zero denominator or complete native coverage. A time, token, context, or response-size limit is not source unavailability: checkpoint unfinished work as `Incomplete`.
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
