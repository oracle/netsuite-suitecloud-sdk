# Evidence, scope and analytical handoffs

Use for analytical findings and their visualizations. The selected runbook owns definitions, calculations, reconciliation and domain gates. These rules govern what the observed evidence permits the answer to claim.

## Scope across a conversation

Retain the user-selected period or as-of date, subsidiary/consolidation, accounting book and currency in task context. Reuse verified internal identifiers without repeatedly asking for the same choice. Resolve genuinely missing choices before dependent analysis. This is conversation-local context, not a saved customer preference.

Keep activity period, balance as-of date, comparison periods and retrieval timestamp separate. A current A/P snapshot does not establish the preceding month-end balance. Where the question requires month-end, use that date when supported; otherwise label the snapshot separately and explain the unanswered question. Separate captions/sections can hold different explicitly requested dates without silently changing the root scope. Each standalone artifact needs a compact scope statement, retrieval time and material coverage limitations.

Do not infer consolidated currency from one subsidiary's base currency, eliminate translation considerations merely because active entities share a currency, or establish access from a role's default subsidiary. Use the actual result and observed access scope.

## Observation and interpretation

| Observation | Supported presentation | Do not infer |
|---|---|---|
| Explicit numeric zero | Zero returned for the identified source and scope | Complete absence of business activity without coverage evidence |
| Successful zero-row response | No matching rows in the observed population | Missing filters were applied, all data is visible, or unrelated populations are empty |
| Blank/null amount | Amount not returned or unknown | Zero, immaterial, or no spend |
| Required evidence not retrieved | Completion/status not established | Task is incomplete in reality or an actual operational blocker exists |
| Explicit task open/blocker evidence | Observed open task or blocker; carry actual dependencies | Every other close task has the same status |
| Denial or tool failure | Describe the affected operation and supported error scope | Universal account failure or permission to try a bypass |

Preserve `unknown`, `not_collected`, `not_observed`, `unavailable`, `denied`, `partial` and `not_run` meanings in working evidence. Do not force these fine-grained states into a renderer field with a smaller enum: use a supported overall state and explanatory notes. Business answers use plain language. A renderer's `blocked` state describes an unmet analysis dependency, not proof of an operational close blocker.

Several queries/reports through the same role may corroborate returned values, but do not independently resolve their shared visibility limitation. Identify the common limitation once. Hypotheses such as a holding entity or connector defect remain hypotheses until evidence locates the cause. Do not request role switching or permission escalation as a routine substitute for respecting an actual denial; any human comparison must use the person's already authorized access.

Treat proposed owners, timelines, close calendars and materiality thresholds as suggestions or documented defaults until applicable company guidance or the user establishes them. State the relevant basis briefly. Do not call an unknown variance immaterial. Open-period preliminary status applies where that period affects the figure; label a separately dated snapshot on its own basis.

## Traceability and finance verification

Maintain source identity/reference, applied filters and date basis, retrieval timestamp, population/coverage, observed value/state, and supporting navigation evidence in working data. Use [links](LINKS.md) for destinations. These are logical evidence requirements, not new fields in any fixed renderer schema; use existing notes, rows, a companion evidence table or a supported alternative.

For a runbook requiring an analyst handoff, retain its producing skill identity and available version, handoff reference, dataset/reference, scope, definitions, reconciliation findings, verification status and limitations. Record a missing version honestly; do not fabricate one. Confirm the actual required dependency supplied the handoff. Do not manufacture a verification status in the visualization layer, rename another runbook to satisfy the dependency, or weaken the gate with a disclaimer. Shared guidance does not make every finance runbook depend on that analyst; the requirement applies where its selected runbook specifies it.

Consume the handoff's figures and status consistently across text, chart, detail and export. Missing evidence prevents a completion claim; it is not permission to mark higher close levels operationally blocked without support. If domain instructions say open prerequisites prevent completion, distinguish an observed open prerequisite from one whose completion was not evidenced.

## Qualification

Keep source/package inspection, resource loading, renderer mechanics, visual review, model behavior, connector execution and business correctness separate. Report only checks performed against the exact artifact/version. A test count or a self-declared `VERIFIED_WITH_LIMITATIONS` string does not establish account correctness. Retain receipts in requested QA detail; communicate the material limitation concisely in the business answer.

## Accounting and quantity comparability

For transaction-accounting-line aggregates, resolve one accounting book for the requested result and filter it explicitly. Default to the verified primary book when the request does not specify another book; never hard-code a book ID or sum duplicate representations across books. Preserve posting, subsidiary, period, currency and line grain. Verify sign conventions against authoritative totals and representative source records before normalizing; blanket ABS can turn credits into spend.

As-of positions exclude future transactions on the applicable date basis. A current unpaid amount is a current position even when its document predates a historical cutoff; historical balances require applications/settlements through that cutoff or an authoritative as-of source. Explain when only current information is available. Reconcile cash definitions, including evidenced Undeposited Funds, before declaring a cash-flow/balance-sheet mismatch.

Keep item and quantity unit in the grain. Never sum unlike items/units into a physical-stock total without a verified common measure and conversion. Missing quantities, sparse history and unassessed checks are not zero. Use stable unique ORDER BY with supported pageSize/pageIndex for ranked details; a ROWNUM filter before ordering does not establish top/latest rows.

## Optional reproducible checks

Selected analytical runbooks may attach [result evidence](RESULT-EVIDENCE.md) and [local calculation checks](CALCULATION-CHECKS.md). These supplement existing source and analyst requirements; ordinary answers and mandatory dependencies keep their current behavior.
