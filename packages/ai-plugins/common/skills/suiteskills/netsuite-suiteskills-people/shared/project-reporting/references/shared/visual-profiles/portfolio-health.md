# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Portfolio Health visual profile

Visual dataset: `VISUAL-2.0.0`; evidence runtime: `PM-4.0.0`.

Own delivery and portfolio synthesis. Select attention for broad reviews; use recorded-date, milestone, change and dependency views only when the actual question calls for them.

Read [presentation](../presentation.md), [visual contract](../visual-contract.md) and the existing domain/evidence rules. Source completeness and request/risk gates precede rendering. Partial results retain an explicit incomplete/limited state.

## Recipe index

- [Portfolio attention](portfolio-health.md)
- [Recorded delivery dates](portfolio-health.md)
- [Milestones and acceptance](portfolio-health.md)
- [Matched-snapshot changes](portfolio-health.md)
- [Verified dependency detail](portfolio-health.md)

<a id="attention"></a>
## Portfolio attention

**Select:** Broad portfolio review or explicit project comparison.

**Required normalized evidence:** complete scoped projects; native Indicator attempts first; task/subtask detail for overdue aging; whole-scope plannedwork versus compatible actual-time detail including completed work; classified risk_findings; frozen request/result, REVIEW-2.0.0 depth plan and complete risk review.

**Measures and definitions:** Distinct scoped projects; distinct projects with supported classified exposure; distinct overdue leaf tasks. Display evaluated and unknown denominators.

**Layout:** Three to five relevant cards, overdue-age chart and projects ranked by overdue count (or independently supported severity), sourced synthesis, prominent gap callout and complete permitted detail. Co-occurrence is not confirmed scoping cause. Render via the carrier helpers as HTML/artifact; preserve the honest fallback.

**Evidence detail:** Select a project/count to inspect task IDs, Risk rule and impact basis, native evidence, source times and exclusions.

**Unavailable and semantic boundaries:** Unknown project evidence remains in scope. Count order is not severity or strategic importance.

**Handoff:** Health owns synthesis; Risk supplies classifications; Operations and Financial supply scoped facts.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="timeline"></a>
## Recorded delivery dates

**Select:** Compare an approved baseline with current recorded dates.

**Required normalized evidence:** recorded_dates: label, baseline_date, current_date, baseline_version, dates_verified, source_refs.

**Measures and definitions:** Record both dates and any supported elapsed difference; never create a finish forecast.

**Layout:** Paired recorded-date timeline with exact baseline/current/date-version table.

**Evidence detail:** Expose baseline identity and actual date fields. Missing one endpoint leaves a missing endpoint, not a shifted marker.

**Unavailable and semantic boundaries:** No baseline/current comparison without verified definitions and version. Do not use an Indicator deadline as a calculated project end.

**Handoff:** Health; request scheduling facts from Operations without recursively restarting the root review.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="milestones"></a>
## Milestones and acceptance

**Select:** Upcoming milestones, acceptance readiness or delivery gates.

**Required normalized evidence:** milestones: explicit milestone identity, dates, completion and acceptance requirements/state with acceptance_verified.

**Measures and definitions:** Count overdue milestones separately from leaf tasks; count awaiting acceptance only with the recorded requirement.

**Layout:** Milestone/acceptance table; recorded-date component where complete.

**Evidence detail:** Show acceptance requirement, source and authority separately from task/effort completion.

**Unavailable and semantic boundaries:** Task completion or 100% effort never establishes deliverable acceptance.

**Handoff:** Health for recorded milestones; Risk for supported acceptance exposure.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="changes"></a>
## Matched-snapshot changes

**Select:** What changed since a prior review.

**Required normalized evidence:** changes.previous/current: identical account, project_ids, role fingerprint, source-definition fingerprint and window basis; findings with stable keys and source refs.

**Measures and definitions:** New, cleared, persisting and changed only after scope/source reconciliation.

**Layout:** Previous/current detail table, each matched finding and context change.

**Evidence detail:** Both snapshots' values, source references, dates and access context are visible.

**Unavailable and semantic boundaries:** Different populations or permission/query definitions produce not-comparable, not cleared/new findings. One snapshot is not a trend.

**Handoff:** Health owns the comparison; supporting owners revalidate changed facts.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="dependencies"></a>
## Verified dependency detail

**Select:** Review intertask or cross-project dependencies.

**Required normalized evidence:** dependencies with edge_verified, predecessor, successor, dependency type, dates and source refs.

**Measures and definitions:** Only recorded edges; factual dependency counts, not invented critical-path or causal scores.

**Layout:** Verified-edge table is the portable default; a diagram adapter may use the same exact edges.

**Evidence detail:** Show link identity, lag/constraint when recorded, and affected tasks.

**Unavailable and semantic boundaries:** Similar names, shared customers and late work do not prove a dependency or critical path.

**Handoff:** Health presents; Risk owns supported exposure; Operations owns permitted link changes.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.



## Audience boundary
Before publishing, apply [account-neutrality-and-disclosure.md](../account-neutrality-and-disclosure.md) and [presentation-integration.md](../presentation-integration.md). Keep the protected evidence, source completeness and action state unchanged; do not serialize arbitrary properties or execute a presentation.

## Adaptive composition
Use [adaptive presentation](../adaptive-presentation.md) and [dashboard presets](../dashboard-presets.md).
The recipes above define semantics and required evidence, not a fixed page sequence.
Select narrative-review for suitable broad findings; PM portfolio remains a Portfolio
Health preset with specialist handoffs. No layout bypasses the source/request/risk,
financial, capacity, privacy or SOW gates. Show synthetic examples only as labeled examples.

## Required broad-review depth
Apply [review-depth](../review-depth.md) before summarizing. Use the actual domain
record/detail-report grain, not only parent totals, then the applicable requirement/investigation
checks. Keep native Indicators first for scoped project analysis. Explicitly identify
required stages unavailable after attempted alternatives. This profile selects visuals;
it cannot reduce the evidence sweep. Default broad output to HTML/artifact and state
why a table/text fallback was necessary. All permitted rows remain in audit detail.
