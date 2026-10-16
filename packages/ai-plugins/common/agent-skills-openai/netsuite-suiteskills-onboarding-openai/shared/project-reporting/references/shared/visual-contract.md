# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Visual contract — VISUAL-2.0.0

V12 OVERRIDE: [automatic scope and HTML output](../primary/scope-and-output.md) takes priority over earlier presentation defaults. Use HTML for structured answers; only a complete, accurate one-fact/one-sentence answer may be plain text. A one-row multi-value result is not an exception. Keep the remaining evidence, privacy and action controls.

Package 4.2.0 / distribution `_v10` uses PM-4.0.0 evidence-led investigation coverage. SOW remains SOW-1.0; native/capacity component contracts remain unchanged.
This is a package output schema, **not** a NetSuite API/schema, permission model or truth validator.

## Table of contents
- Selection and pipeline
- Input normalization
- Dataset and provenance
- Completeness
- Rendering and security
- Reuse and refresh
- Helpers and examples
- Integration limits

## Selection and pipeline
Choose the domain owner first. Use [profiles](visual-profiles/portfolio-health.md) for broad reviews,
comparisons or explicit visual requests. Keep a narrow answer concise with sources (optional fact/metric tiles), retaining its limitations and
requested order. `visual_dataset.select_mode` only selects format; it does not change required analysis.

Pipeline: existing owner and native-first/source workflows → normalized evidence → existing business
helpers and complete applicable risk/request gates → descriptive aggregates → visual dataset →
host-supported renderer or evidence-equivalent Markdown. A presentation module never queries NetSuite,
assigns risk severity, colors a native Indicator or executes a proposed action.

Five profiles are modes of four skills: Portfolio Health; Operations; Operations SOW; Risk; Financial.
All resources live in this carrier, but ownership remains with the relevant domain.

## Input normalization
`visual_dataset.build(payload)` accepts:
- `profile`: portfolio-health, operations, operations-sow, risk or financial; optional `recipe` from references/shared/visual-config/recipes.json.
- `snapshot`: immutable ID; synthetic flag; aware as_of; IANA timezone; exact project/resource/user scope;
  window label and supported start/end; source identity; source evaluation times; request/context signatures;
  optional filters and accounting context. Build signatures with completion_gate.signature; do not invent a gate receipt.
- `sources`: minimally disclosed source/reference, fields, grain, filters, retrieved/evaluated times (null if absent),
  actual channel state, pages/periods completed, limitations. Exhausted unavailable states also record attempts,
  alternatives_accounted_for and remaining_usable_channels. A failed metadata call is not feature absence.
- `request` and `result`: the PM-4.0.0 frozen obligation/result ledgers for existing projects.
  The visual adapter invokes completion_gate, which invokes the existing full risk gate.
- `evidence`: domain-normalized facts described below. IDs and keys are package-normalized, never guessed NetSuite fields.
  Supply only records authorized for the intended audience. Existing gates do not replace permission checks.

| Input family | Required interpretation / upstream work |
|---|---|
| projects | Complete requested directory and readable labels, independent of warning/fact rows |
| tasks | One task row at project/task grain: verified completion, executable leaf, dates/effective due semantics, source refs. Keep assignments separately; consolidate duplicate join facts before this adapter. Compatible planned/actual hour comparison is descriptive effort only. |
| assignments / resources | Verified natural identity, explicit kind/generic/active/eligible/role mapping, actual assignment coverage, effective end, and sourced gaps; no name-prefix inference |
| risk_findings | Classifications already owned by Risk; supply explicit verified classification and impact evidence. Renderer never derives severity from counts, native RAG or delay length. |
| native_input | Exact indicator_tools.select_results arguments: rows, projects, types, cutoff and applicable historical/transport/type-universe flags. All discovered types/statuses and missing pairs retained. |
| coverage_detail_input | Exact coverage_detail.normalize arguments: source rows and verified assignment map; do not re-deduct leave or sum incompatible windows |
| recorded_dates / milestones / dependencies / changes | Exact observed baseline/current values plus version; independently verified acceptance; explicit verified edges; matched snapshot context |
| capacity_input / candidate_request | Exact existing capacity_tools arguments. Dated plannedwork, complete resource directory and net calendar/leave cells; date matched requirements and verified exact employee roles. No allocation substitution. |
| placements | Unique proposal identity, resource/day hours, role/eligibility verification. Reservation is scenario-only and consumes spare hours once in input order. Do not label scenario fit as a native allocation or authorized assignment. |
| queues | Distinct task, manager-responsibility, approval and follow-up queue kinds; exact authenticated entity matching and current routing verification for personal queues |
| money | Nonoverlapping additive source_id/row_id grain, actual project, currency/book/period/basis/kind, amount (null unknown), complete population, approval/posting evidence. Budget baseline/version remains in source details. Never add different measure kinds. |
| billing / cash / procurement / revenue / policy | Prevalidated Financial rows at their natural grain, explicit amount kinds/links/contexts, complete rule populations where needed. Tables do not invent eligibility, aging clocks, allocation of money to a project or a reconciling waterfall. |
| plan / prior_plan / ledger | Unchanged SOW-1.0 objects; existing sow_tools validate/diff/report behavior. No renderer-side edit, approval, execution or retry. |
| actions | Existing card.schema.json action cards with exact state, evidence and recheck; portable output always display_only |

Do not use the source flags as a way to "declare" missing verification complete. They represent documented
upstream evidence. This offline adapter checks declarations and arithmetic, not the account itself.
Unresolved mappings must remain partial/unavailable, not be fabricated to satisfy a schema.

## Dataset and provenance
`visual-dataset.schema.json` reuses `card.schema.json` without changing it.
Dataset: snapshot, source inventory, actual gate output, three-to-five relevant cards, panels, action cards,
limitations and a deterministic content digest. Every panel includes exact rows, definitions, scope/window,
filters and source refs. Calculated rows additionally retain a formula and contributing row references.
Data display and formulas stay in the owning domain; the renderer computes only geometric scales.

Observation, reproducible calculation, native status and proposal are explicit provenance kinds. Native
severity is a different field from calculated High/Medium/Low/Unrated. Neither is an evidence-completion score.
Supported empty results differ from absent inputs. Null values display Unavailable/Not measurable with reasons.
Hours, money and unrelated monetary contexts never share an unlabeled scale or aggregate.

The content digest detects accidental visual changes; it is not a signature, authentication, immutable ledger,
approval, permission check or guarantee of truth. Regenerate the dataset if its source facts change.

## Completeness
For live-project analysis, pass the frozen request/result objects to the existing completion gate; never replace
them with a visual-specific boolean. Preserve all frozen investigation searches, candidate dispositions and required source/period scope.
A failed gate can render useful evidence only as Incomplete. Exhausted unavailable checks are Limited, not clear.
The complete declared investigation and source-completion appendix remain available behind every relevant focused risk chart.

The dataset preserves ordered requested outputs. A table filter changes **only visible detail rows**.
Chart totals, KPI values and the root denominator remain explicitly unchanged. Changed root scope requires
a new domain analysis and new gate result. Missing financial evidence for a scoped project remains visible.

Document-only SOW planning with no existing project population uses the existing plan validator and plan-risk
workflow; no fictional native query or live risk result is required. Keep plan validation, account validation,
approval, approved-subset execution, whole-plan disposition, delivery readiness, billing readiness and live risk
separate. A renderer is not evidence that any of these completed.

## Rendering and security
Preferred components: labeled KPI cards; zero-inclusive bars/paired comparisons; recorded-date timelines;
daily numeric capacity matrices; exact-value tables; source/row disclosure; proposed-action cards.
All charts have text/table alternatives. Colors supplement text. Show critical limitations outside disclosures.
No numbers may originate from CSS or JavaScript. No data enters executable HTML/JS/URLs.

The supplied portable renderer has no external libraries/network requests, no native API calls, no execute
button, no refresh button and no editable plan controls. Search filters, anchor navigation and disclosures are
local and read-only. Unsupported interactive hosts receive Markdown/table output, not claimed widgets.
HTML text is escaped; Markdown escapes executable markup and untrusted links. Local artifacts contain data:
review the audience and storage policy before sharing. Source references are displayed as evidence text;
do not invent deep links. A host may add only verified authorized links using its own safe link mechanism.

## Reuse and refresh
A style/layout-only request reuses the same dataset and timestamps. `snapshot_compatible` conservatively
requires the same complete envelope; changing account, role, authorized population, source identity,
dates/timezone, window, financial context, capabilities, candidate-price requirement or ordered request
requires domain revalidation and a new snapshot. New data are never acquired by the renderer.
No automatic Indicator refresh claim; source readback and an observed new evaluation remain separate.

## Helpers and examples
Read [helper interfaces](helpers.md) and the relevant profile. Use only an actual code/file host.
The five files in `external generated development-artifacts directory/*.input.json` and their HTML/Markdown outputs are synthetic offline
fixtures. They must never be loaded as account data or defaults in a business answer.

From the edition root, substituting real authorized normalized files:
```
python -B skills/netsuite-suiteskills-operations-openai/runbooks/netsuite-project-portfolio-health-assistant/scripts/visual_dataset.py build input.json --output visual.json
python -B skills/netsuite-suiteskills-operations-openai/runbooks/netsuite-project-portfolio-health-assistant/scripts/visual_dataset.py validate visual.json
python -B skills/netsuite-suiteskills-operations-openai/runbooks/netsuite-project-portfolio-health-assistant/scripts/visual_render.py visual.json --format html --output report.html --policy audience.json --execution-context root-task.json --tool-trace tool-pulls.json
python -B skills/netsuite-suiteskills-operations-openai/runbooks/netsuite-project-portfolio-health-assistant/scripts/visual_render.py visual.json --format markdown --output report.md --policy audience.json --execution-context root-task.json --tool-trace tool-pulls.json
```
These commands write local presentation files only. They never create NetSuite records.

## Integration limits
An intended host's skill resolution, prompt behavior, artifact display and account permissions need separate
deployment checks. Python/JSON Schema/browser fixture success is not proof that an LLM executes the instructions.
No React/Recharts, particular MCP tool prefix, Canvas, inline renderer, server or fifth skill is required.


## Audience-specific publication
Apply [account-neutrality-and-disclosure.md](account-neutrality-and-disclosure.md). Keep protected evidence separate from the strict [presentation dataset](presentation-dataset.schema.json). Supply the host-reviewed policy to both renderers; never serialize raw source/context/row objects. Sanitized display objects cannot replace executable plans or change completion outcomes.

## Adaptive dashboard extension
Use [adaptive composition](adaptive-presentation.md), [presets](dashboard-presets.md),
[layout schema](adaptive-layout.schema.json) and [PM input](pm-portfolio-input.schema.json)
when richer views are useful. The five existing domain profiles and 29 recipes remain.
DASHBOARD-1.0.0 supplies optional normalized PM views and descriptive insight panels.
PRESENTATION-2.0.0 explicitly permits only their declared fields after the existing
audience review. LAYOUT-1.0.0 selects components; it cannot recalculate business evidence,
drop required audit sections, grant permission or serialize protected raw objects.

## Dashboard-first broad reviews (inherited, coordinated in v8)
Use [review-depth.md](review-depth.md) as the controlling evidence/delivery workflow.
Broad reviews, comparisons and multi-item analysis across delivery, operations,
financials or risk normally produce rendered HTML/artifacts, not an unannounced
Markdown-only dump. Prefer real host inline tools; otherwise deliver portable HTML.
Use 3–5 relevant summary cards and 1–2 suitable overview charts, followed by sourced
Confirmed evidence, optional labeled Interpretation and a visible coverage-gap callout.
Card/chart counts are evidence-backed targets, not permission to fabricate a measure.
Keep full permitted detail, original requested order, source captions and definitions.
Partial data do not imply no dashboard: render an explicitly Limited/Incomplete review
when truthful. Fallback must name unsupported delivery, misleading visual encoding,
or explicit user text preference; it preserves all permitted detail. Failed publication
authorization blocks every format. A genuinely simple named-item fact may remain concise; a multidimensional finding still uses a graphical dashboard.
The numerical/causal/risk and SOW action boundaries are unchanged.

Runtime assets are component CSS/JavaScript, not saved data or page templates.
The registries and privacy field allowlists are in
[visual-config/recipes.json](visual-config/recipes.json),
[visual-config/layout-presets.json](visual-config/layout-presets.json) and
[visual-config/presentation-fields.json](visual-config/presentation-fields.json).
Development artifacts are generated outside the installed skill and never used as
literal findings. Changing layout cannot change scope, numbers, privacy or approvals.

## v10 output requirement
Follow [task execution](task-execution.md) and [answer visuals](answer-visuals.md). Use graphical dashboards for substantive multidimensional analysis; a complete single fact expressible in one sentence without additional detail may remain concise. Keep every source, definition, permission gap and caveat inside the deliverable. Complete cheap relevant cross-domain reads without a follow-up offer, and bind every figure to current-conversation tool results.

## Focused scalar output
The optional `evidence.answer_facts` input follows [answer-facts.schema.json](answer-facts.schema.json).
It selects one or two typed values from already-supplied evidence for existing string/number KPI cards.
No output schema expansion or new account mapping is required. Values and source bindings are
validated by `fact_tiles.py`, not inferred from prose.
A single focused signed request with no broad review-depth plan uses the existing request/source/
native/discovery gate directly. It does not assert that broad review-depth stages were run.
A broad request cannot use display flags such as `--narrow` to bypass its depth requirements.

## Task-policy integration
Apply [task-execution.md](task-execution.md) before production delivery. One silent connector selection
is reused for all four skills; no relevant connector means a plain stop, not a sample report.
Use current-conversation tool-grounded figures. Put definitions, original source dates, coverage,
permissions and material limitations within the artifact, not in a caveats postscript.
Keep major gaps visible. Routine cross-domain reads and cheap natural next-level detail are performed
now without offers; existing write approvals and disclosure controls remain unchanged.
For genuine one-fact single-sentence exceptions the plain text includes its own essential provenance and limitations.
