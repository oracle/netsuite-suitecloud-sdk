# Dashboard output

Use the bundled template only when the host supports creating and previewing local HTML. Otherwise return the assessment as conversation text and tables, preserving all facts, findings and coverage. Do not require a live-artifact API or imply persistent refresh. A requested standalone HTML file is an optional output when file creation is available.

## Populate the assessment

Replace only the `const assessment = ...;` object in the template with a JSON-serialized assessment derived from this run's retrieved evidence. Escape `<` as `\u003c` in serialized JSON embedded in the script to prevent record text from terminating it. No placeholders, example employee data, API tokens, bank details, or sensitive identifiers belong in the delivered dashboard. The template escapes displayed text and rejects unsupported link shapes. Supply `scope.accountHost` as the exact verified account UI hostname and only verified record navigation URLs. Syntax checks alone do not establish record identity or access.

Data shape:

- `scope`: `subsidiary`, `frequency`, `runType`, `period`, `payDate`, `status`, `reviewedAt`, `assessment`; also `payrollFeature` (`enabled`, `disabled`, or `unknown`), `payrollFeatureSource` (read source or labelled user confirmation), and `auditMode` (`native`, `inventory`, or `retrospective`). Use display strings with unambiguous dates; the review timestamp is the actual evidence snapshot time, not a moving clock. For inventory-only mode, set inapplicable period/pay-date/type/status strings to “Not applicable — employee inventory only,” not fictitious run values.
- `population`: `reviewed`, `active`, `inclusionExceptions`, numbers established by complete population retrieval. Use `null` when unknown rather than zero.
- `employees`: one object per employee needing action, with `id`, `name`, optional verified `recordUrl`, and `issues`. Each issue has `id`, `title`, `severity` (`blocker` or `attention`), `category` (`setup`, `inclusion`, `time`, or `other`), `evidence`, `action`, and optional verified `recordUrl` for an affected transaction. Multiple issues belong under the same employee. Preserve non-employee findings separately in `otherFindings` using the same issue fields plus `recordName`.
- `checks`: objects with `label`, `reviewed` (`complete`, `partial`, `unverified`, or `not-applicable`), `outcome`, and `evidence`. Coverage refers to performed reviews; a completed review can discover a blocker.
- `milestones`: confirmed dates only, each with `date`, `title`, `note`, and optional `current: true`. Do not infer processing deadlines from pay date. The current marker refers to the snapshot, not live progress.
- `checkpoints`: objects with `title`, `note`, `outcome`, and `filter` (`setup`, `inclusion`, `time`, or `coverage`). Filters drill into existing evidence; they do not run tools.
- `fyi`: optional strings for general audit context only. Do not create an FYI employee population or separate employees not included in payroll; frequency counts retain all employment/inclusion states. Do not label employees eligible or defective from inclusion status alone.

## Visual and behavioral contract

The default Overview prioritizes verified blockers, then attention items. Display reviewed population, verified blocker findings, unique employees needing action, and coverage. Blocker findings and employee counts overlap and must not be added together. For completed payroll use retrospective wording and no current processing blockers.

Employee worklist shares the same employee objects, with name/ID/issue search, category filters, and expandable evidence and next action. Preserve internal IDs and show “Record link unavailable” if no verified UI URL exists; never generate account domains or use API endpoints as UI links.

Pay-cycle checkpoints shares the same findings. Distinguish observed snapshot date, confirmed planned dates, verified cutoffs, and unknown cutoffs. Do not mark pending inputs overdue without a verified deadline. Dates alone do not prove a processing step completed.

Keep payroll scope, snapshot timestamp, read-only status, and coverage visible across tabs. Coverage is Partial when any applicable check is partial or unverified; not-applicable checks do not reduce coverage. Never use a readiness percentage or guarantee successful processing. Treat assignment presence and payment flags as narrower evidence than setup correctness or completeness.

Include a Payroll availability check with its gate value, evidence source, and snapshot. Show the gate and audit mode in the shared header. An inventory-only run must display **“Payroll readiness not assessed”** rather than Completed coverage or a readiness conclusion even if all applicable inventory checks completed. Mark skipped native checks not-applicable only for confirmed-disabled Payroll; for unknown feature state use one grouped unverified check. An enabled account with an uncreated run may separately mark calculated results not-applicable for that reason. Zero employee findings in inventory mode means no recorded inventory findings, not a payroll pass. Put required administrator confirmation or source-access action in `checkpoints` with filter `coverage`, not a fabricated employee defect. Do not populate native payroll milestones while the gate is disabled or unresolved.

Use calm spacing, short action titles, navy text, teal review accents, amber attention and red only for verified blockers. Keep labels alongside color. Support keyboard navigation, expandable evidence, mobile reflow, and empty/no-findings states. Do not display missing data as zero or retain invented template checks.

The dashboard is an evidence snapshot. Search, filters and expansion operate locally. A new account review requires a connector run; do not add approval, resolve, payment or live-refresh controls. Keep previous-run amount comparisons in tables. Give a concise chat summary alongside the dashboard stating scope, assessment, priority actions and material gaps.

Before rendering, validate unique employee and issue IDs, recognized enum values and array shapes. For retrospective or inventory mode, do not supply current-processing blockers. Preserve unknown counts as null; an empty issue array is only the recorded findings, not proof of complete coverage.
