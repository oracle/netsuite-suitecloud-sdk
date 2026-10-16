# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Adaptive presentation

V12 OVERRIDE: [automatic scope and HTML output](../primary/scope-and-output.md) takes priority over earlier presentation defaults. Use HTML for structured answers; only a complete, accurate one-fact/one-sentence answer may be plain text. A one-row multi-value result is not an exception. Keep the remaining evidence, privacy and action controls.
## Purpose
Compose approved evidence, not a mandatory page template. The adaptive layer supplies LAYOUT-1.0.0
and DASHBOARD-1.0.0; PM-4.0.0 evidence and VISUAL-2.0.0 use investigation coverage, while SOW-1.0 and the native Indicator component remain unchanged. Publication moves additively to PRESENTATION-2.0.0 for new
explicitly allowlisted panel fields; PRIVACY-1.0 review remains mandatory.

## Workflow
Complete the existing domain analysis first. Run source, ordered-request and
applicable evidence-led investigation gates. Build the protected VISUAL dataset.
For PM-specific evidence, include the normalized, verified `pm_portfolio` extension
described in pm-portfolio-evidence.md. Keep expected project rows even when data is missing.

Project through presentation_disclosure using a separately authenticated audience/
purpose/content review. This includes synthesized prose, source captions, chart labels,
tooltips, expandable evidence and all exports. The new layout code must never read
protected raw evidence directly, mutate the SOW plan or manufacture an approval.

Choose a layout using actual question breadth, audience, data shape and host capability:
- Single noncomparative fact/row: concise source-backed prose/table is allowed; use tiles for an explicit visual request. Lists/comparisons use a graphical view.
- Broad findings review: prefer the narrative-review preset.
- Exact PM portfolio: use pm-portfolio when verified input is present.
- Explicit user arrangement: adapt overview components, density, card count and chart/table balance.
- Unsupported inline AND artifact output: preserve the same permitted answers, definitions and limitations in text/tables with an explicit reason.
Use classic as a compatibility fallback, not as a new universal layout mandate.
For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.

## Layout, not data
`adaptive_layout.build` accepts safe enums for preset, density, theme and arrangement;
optional card and overview panel IDs must exist in the approved presentation.
The plan is bound to the presentation content hash. Every panel remains available
exactly once, including ordered obligations and investigation coverage. Omitted overview
cards remain in supplemental evidence. An explicit `cards=[]` is supported.
No arbitrary HTML, Python, JavaScript, formulas, titles, source queries or CSS enter
the layout plan. Layout hashes detect edits; they do not confer authority.
A new PM, date window, authorization scope, role, source definition or evidence
snapshot requires new analysis/disclosure; a local picker is not an account query.

## Rich output precedence
Discover the host's actual visual rendering capability, accepting its actual schema.
Prefer supported inline rendering of the approved components. Otherwise provide a
portable generated HTML artifact when the host can expose it honestly. Otherwise
provide Markdown/text. Do not assume React, Recharts, a connector prefix or proprietary
renderer. A local HTML file is not proof that an inline visual was rendered in chat.
All synthetic examples are test/design material and must never be reused as live findings.

## Components and accessibility
Cards are optional; normally select a few relevant measures, never fill empty slots.
Treat Overview/Insights/Sourcing as logical regions: actual accessible tabs when
supported, headings/anchors otherwise. Essential coverage warnings remain outside tabs.
Use compatible light/dark surfaces, visible focus, labels in addition to color, exact
tables accompanying charts, and no network-loaded assets. Novelty is not a reason
to change arrangements randomly. Keep familiar structure for equivalent recurring reviews.
Native color is not risk severity; co-occurrence and concentration are not causal
or statistical claims. A confirmed numerical difference is not automatically High risk.

## Local helper use
Build: `python scripts/visual_dataset.py build input.json --output dataset.json`
Project: `python scripts/presentation_disclosure.py project dataset.json --policy reviewed-policy.json --output presentation.json`
Layout: `python scripts/adaptive_layout.py presentation.json --preset narrative-review --arrangement balanced --output layout.json`
Render: `python scripts/visual_render.py dataset.json --policy reviewed-policy.json --layout layout.json --format html --output review.html`
Use `--format markdown` for the same data with an honest text/table fallback.
The host supplies the actual content review. Do not auto-generate approval from hashes.

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

## Task-policy integration
Apply [task-execution.md](task-execution.md) before production delivery. One silent connector selection
is reused for all four skills; no relevant connector means a plain stop, not a sample report.
Use current-conversation tool-grounded figures. Put definitions, original source dates, coverage,
permissions and material limitations within the artifact, not in a caveats postscript.
Keep major gaps visible. Routine cross-domain reads and cheap natural next-level detail are performed
now without offers; existing write approvals and disclosure controls remain unchanged.
For genuine one-fact single-sentence exceptions the plain text includes its own essential provenance and limitations.
