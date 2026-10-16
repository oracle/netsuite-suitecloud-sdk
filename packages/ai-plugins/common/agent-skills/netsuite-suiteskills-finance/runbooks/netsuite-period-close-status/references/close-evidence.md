# Period Close Evidence Procedure

Use supported read capabilities and their actual callable schemas. This procedure supplies domain source selection; the pinned retrieval, evidence, period-coverage and financial verification contracts still apply. Names below are discovery candidates, not proof of an installed record, query table, field, relationship or permission. No account-change or custom connector implementation is supplied.

## Scope and period selection

Reuse explicit user scope. Resolve accounting period identity and type (month, quarter, year or adjustment), subsidiary/consolidation, accounting book, currency and as-of request. When these dimensions are irrelevant to a narrow selected-record fact, do not require unrelated lookups. Record the scope of the fact actually returned.

Discover a supported period record read, saved search or report. `accountingperiod` is a candidate record/table identity. Candidate properties include period name, start/end dates, parent/type/adjustment classification, closed state and accounts-receivable, accounts-payable, payroll or all-transaction lock flags. Establish actual supported names and meanings before use. A record-read shape does not validate a SuiteQL source or join.

Resolve multiple matches using actual identity/date/type evidence; ask only for the unresolved choice. Do not silently choose the latest open period, treat a fiscal period as a calendar month, combine month/quarter/year totals, or include an adjustment period by date coincidence. Establish adjustment and constituent-period coverage from supported relationships and customer close policy before a combined conclusion.

Use subsidiary/book scope only as actually exposed by the source. Global period state is not per-subsidiary proof. A default book must be established and disclosed; do not assume primary book merely from a report title. For a historical as-of request, current flags, task status and pending-transaction snapshots do not establish past state without a dated historical source. Preserve the requested historical scope and label any useful current snapshot separately. Record effective state-time separately from retrieval time when the source establishes it; do not invent a historical effective time.

## Retrieve the requested evidence

| Section | Supported source branch to discover | Evidence required before using the result | If unavailable |
| --- | --- | --- | --- |
| Period flags | Selected period record read, matching report/search, or metadata-supported period query | Actual period identity, returned fields, value meaning, scope and observation time | Return independently supported fields; missing state is not verified |
| Close tasks | Accessible Period Close Checklist record/report/search, or supplied scoped task/owner evidence | Task identity, status meaning, scope, applicability, owner if returned, source and status time | Checklist completion and dependent readiness not verified; period flags can still be reported |
| Pending activity | Type-specific report/search with verified filters, or current-metadata-supported transaction query | Distinct header grain, eligible financial types, approval/posting meaning, period assignment and requested scope | Count/impact unavailable or partial as appropriate; do not invent schema or broaden scope |
| Specialist result | Actual available specialist workflow and its evidenced output | Exact supported outcome, compatible scope, source/time and completion/limitations | Dependent specialist result unavailable; retain independent close facts |

For each branch, discover the source identity and actual parameters or reuse valid evidence already established in the same scope/session. A report/search title alone does not prove filters or completeness. If querying, establish query metadata for every field, relationship and predicate; record metadata is not a substitute. Use the supported typed query preparation and pagination interface where applicable, never paste untrusted text into SQL.

Read the requested scoped population and record pages/ranges, caps and material permission limits. An exhausted page sequence proves only the population that the source and applied filters establish. A successful empty result becomes a verified zero only for that established complete population. Incomplete, denied or unknown sources remain partial/unavailable, not no blockers or no pending work.

Stop only the affected branch on denial or missing essential evidence. Continue independently supported sections. A fallback must be separately supported, answer the same qualified question and preserve access boundaries; it may not evade a data denial. No fixed report ID, guessed status map, diagnostic query or extra generic source order repairs a missing prerequisite.

## Observed flags and close tasks

Preserve each returned lock/closed value as an observed flag, not a proxy for completion of a readiness level. Missing values remain unknown. Keep contradictory or differently scoped evidence visible with its time; do not choose a convenient value or overwrite recorded task status.

Resolve checklist/task completion meaning from the source and evidenced customer close policy. Use open, completed, not applicable, not verified and blocked with their actual basis. Not applicable requires evidence. A blocker is an observed unmet prerequisite; lack of connector visibility is an evidence gap. Owner absence remains unknown and does not justify assigning a person.

The five-level model controls reported final readiness, not native workflow enforcement. Applicable open prerequisites make dependent levels not ready; unknown prerequisite completion/applicability makes dependent readiness not verified where an evidenced open prerequisite has not already established not ready. Keep other unknowns visible even when an open prerequisite establishes not ready. A recorded higher-level completion remains an observed completion even when its modeled readiness is not satisfied. A single current level is indeterminate when missing prerequisite evidence prevents establishing the readiness frontier; do not force one from the highest observed completed task. Report missing consolidation verification separately from any observed checklist task.

## Pending financial activity

`transaction` is a candidate header source. Potential concepts include transaction ID/type, approval state, posting state, posting period, subsidiary, date and compatible amounts. Actual fields, status meanings and relationships require current source evidence. Never assume one approval code or a `posting = false` predicate means unfinished close work across all transaction types.

Establish the eligible financial population and type-specific close relevance. Intrinsically nonposting operational records are not automatically unfinished accounting work. Establish canceled, rejected, voided or other terminal-state treatment from verified type semantics and close policy; do not silently count or discard them based on a guessed status. Distinguish pending approval, unposted and other incomplete states; a transaction can belong to multiple sets. Count distinct verified header IDs within each type, eliminate join duplication and disclose overlaps. Do not add category counts as a combined total unless the union has been independently established. Incompatible subsidiary/book populations also must not be added.

Check posting-period assignment coverage over the same relevant candidate population using [period coverage](../../../shared/contracts/PERIOD-COVERAGE.md). A period-filtered query can omit unassigned records. Missing assignments limit completeness but do not prove those records belong to the selected period; never assign them from transaction date. Unknown assignment counts stay unknown.

For impact, use a returned compatible amount or a reviewed calculation with its source basis: currency, book, period, sign, header/line grain and what the amount represents. Keep currencies and bases separate. Pending transaction totals are not automatically ledger impact; do not sum absolute document totals as universal impact. A balanced journal's zero net does not establish no balance-sheet or profit-and-loss effect. If appropriate source/control evidence is absent, report impact unavailable while retaining independently verified counts or individual observations.

## Lock date and concise delivery

Keep the requested target date separate from a calculated estimate. A realistic estimate needs evidenced remaining durations, owner estimates, dependencies and the applicable working calendar. If any essential input is unknown, report the estimate unknown and identify the missing input. Do not calculate it from the number of open levels or illustrative T+n targets.

Use the root output shape for the requested sections. Include scope, actual source/time, population coverage, recorded task status, modeled readiness and material specialist gaps. Do not claim a completed handoff, final clean close or created artifact that was not observed. This review performs no checklist update, approval, posting, lock or close action.
