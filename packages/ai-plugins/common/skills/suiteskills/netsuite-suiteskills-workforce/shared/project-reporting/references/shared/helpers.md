# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Deterministic helpers and normalization boundary
All scripts are standard-library Python 3.10+ except the optional authoring validator (PyYAML).
They do not query NetSuite, execute financial rules in NetSuite, write records or calculate native Indicator colors.
Use metadata-backed SuiteQL/Saved Searches/SuiteScript for authoritative business retrieval and account-owned formulas.
These helpers verify submitted normalized evidence, arithmetic, selected timestamps and completion structure; a boolean declaration is not independently verified account truth.
Keep original returned rows, field mappings, capture times, query/report parameters, lineage and hashes for audit.
The host executes tools under actual discovered contracts; do not invent an agent API, parallel run, background refresh, or persistent store.

## Files
- `risk_gate.py`: frozen evidence-led search plan, exact scope/partitions, native-first stage, complete candidates and source alternatives; no static catalogue.
- `completion_gate.py`: frozen arbitrary request obligations, exact order/content, population partitions, source alternatives, pages/periods and embedded risk gate.
- `indicator_tools.py`: all-status project/type pair inventory and cutoff selection on supplied normalized rows.
- `capacity_tools.py`: runtime-local date, validated project end choice, exact personal identity, ordinary plannedwork daily ledger and candidate checks.
- Use the category index to select the retained Financial or Risk runbook. The historical cross-domain/action router is excluded.

## Indicator normalizer
Flat native keys from the backend (`id`, `project`, `indicatortype`, `status`, etc.) are retained.
`evaluated_at` is a PACKAGE key used only when a real source evaluation timestamp is returned or independently verified.
Do not populate it from lastmodifieddate or retrieval time. Preserve the actual source field/mapping.
A returned current row may be shown with freshness only, but the selector will not assert historical evaluation alignment.
All unknown/new type IDs remain in coverage; type-universe completeness is a separately evidenced property.

## Plannedwork normalizer
`basis`, `resource_key`, `lineage_verified`, `distribution_verified`, `leaf`, and capacity proof keys are PACKAGE fields, not NetSuite schema.
Use exact typed resource keys (for example employee:123 versus vendor:123); verify all actual IDs.
Demand requires a proved dated decomposition of plannedwork. Do not pass a total without dated lineage or Resource Allocation inputs.
Reconcile the source's complete dated plan to its exact assignment/task plannedwork total before filtering the requested dates.
Keep task totals as checks, not additive rows; totals plus their detail are not two demands.
Net capacity inputs already include nonoverlapping holidays/approved leave and source capacity factors once.
Materialized calendar gaps remain missing, not zero. Store interval/source proof outside the normalized number.
`capacity_tools` rejects allocation/actual/estimated basis and flags missing daily cells.
Price display is distinct from price use; price-ranked candidates require a proved common price context.
Multi-placement proposals must debit a scenario copy of spare hours by the approved date requirement after each proposed placement; never mutate authoritative ledger or NetSuite to reserve hours.
If no approved daily placement pattern exists, present conditional aggregate possibilities, not confirmed date-feasible placements.

## Completion inputs
Freeze the request object before answering. Each obligation contains original text, order, owner, scope/window, required source checks and expected member keys by unit.
The result echoes each exact obligation and partitions all expected members into evaluated/unavailable/not_applicable/unresolved.
Source `covers` objects exactly match the frozen required plan. Pending authorization, pages or periods are incomplete, not exhausted unavailability.
A substantive result embeds risk_review itself; a fabricated `gate_passed:true` flag is not accepted instead.
Use synthetic fixture examples in the edition's tests directory. Do not copy their dates, IDs, outcomes or assumptions into live answers.

`coverage_detail.py` preserves verified native-detail row grain and missinghours, maps assignment identity only when verified, and never reconstructs color or sums overlapping windows.

## Proposal handoff

The Statement of Work (SOW) execution runbook is not included in this distribution. Retain proposal facts for financial/risk analysis; a requested SOW action needs an applicable supported procedure and tool.

## v4 visual support — no new business engine
`visual_metrics.py` contains task aging/deduplication, assignment-state grouping, compatible money aggregation,
matched-snapshot differences, daily-capacity summaries, nonduplicated proposed consumption and conservative
policy/billing/cash presentation normalization. It calls `capacity_tools` rather than duplicating its demand logic.
`visual_dataset.py` accepts normalized evidence and the original request/result ledgers, calls the existing
completion/risk, Indicator selection, native-detail and SOW helpers, and validates `VISUAL-2.0.0`.
`visual_render.py` escapes the validated dataset into local HTML or evidence-equivalent Markdown, with no network,
mutation, automatic refresh, classification, accounting calculations or native status reconstruction.

Input/output fields and CLI examples: [visual contract](visual-contract.md).
The visual JSON Schema reuses [card schema](card.schema.json); optional JSON Schema validation complements the
standard-library validator. Structural validity cannot authenticate evidence, permissions, approvals or a run.
No source, helper invocation, risk sweep or deterministic gate may be reported as executed unless it really ran.

## v7 review-depth and delivery helpers
Read [review-depth](review-depth.md). `review_depth.py` compiles the source-depth plan
and wraps the original request/risk gates. `review_metrics.py` summarizes whole-scope
effort independently of overdue-only work. `review_delivery.py` chooses actual inline/
artifact capabilities and an explicitly explained fallback after the privacy gate.
Low-level legacy `visual_render.py --format` remains explicit and compatible; use
the v7 orchestrated delivery command for automatic broad-review output selection.

## TASK-1.0.0 production handoff
Before account-backed delivery apply task-execution.md. review_delivery.py and the visual_render.py
CLI require --execution-context root-task.json and --tool-trace tool-pulls.json on nonsynthetic data.
Both are protected host-authenticated runtime inputs, never bundled samples. No connector means stop;
otherwise all figures bind to actual same-conversation pulls and the current immutable dataset.
Run task_execution.py on the task context to inspect the local selection decision; this utility
does not connect, grant access, ask a human, execute a domain skill or authenticate a tool call.
