# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Operations visual profile

Visual dataset: `VISUAL-2.0.0`; evidence runtime: `PM-4.0.0`.

Own operational work and permitted project actions. Keep personal, manager and approval queues distinct. Capacity is dated plannedwork only; native staffing coverage remains independent.

Read [presentation](../presentation.md), [visual contract](../visual-contract.md) and the existing domain/evidence rules. Source completeness and request/risk gates precede rendering. Partial results retain an explicit incomplete/limited state.

## Recipe index

- [Work queues](operations.md)
- [Daily work and capacity](operations.md)
- [Exact-user routed approvals](operations.md)
- [Staffing exceptions](operations.md)
- [Employee role/capacity comparison](operations.md)
- [Proposed placement scenario](operations.md)

<a id="work"></a>
## Work queues

**Select:** Daily action review, personal work, team responsibilities.

**Required normalized evidence:** queues with queue_kind, exact entity type/reference, routing_verified, due/priority evidence; tasks and assignment data.

**Measures and definitions:** Distinct assigned work and routed approval records in separate queues; due today separate from overdue.

**Layout:** Queue tables with recorded priority, due dates, owner/routing and proposed next step.

**Evidence detail:** Show exact-user matching and workflow state; manager responsibilities are distinct from personal tasks.

**Unavailable and semantic boundaries:** Unverified identity moves a row to unresolved personal routing, not my tasks.

**Handoff:** Operations; Risk for exposure classification; no rendering control performs an action.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="capacity"></a>
## Daily work and capacity

**Select:** Overload, availability, bench time or workload comparison.

**Required normalized evidence:** capacity_input uses capacity_tools.daily_ledger: complete resource directory, validated dated plannedwork, net calendar/leave rows, supported start/end.

**Measures and definitions:** Positive daily excess hours/cells; positive spare hours separately; unknown cells; ratio only with a positive compatible denominator.

**Layout:** Daily resource matrix with numeric planned/net hours, shortage labels and exact-value table.

**Evidence detail:** Show dated commitments, calendar and nonduplicated leave evidence. Keep native remaining-work coverage separate.

**Unavailable and semantic boundaries:** No total spreading, allocation substitution, unknown-as-zero or weekly-net hiding daily shortages. Zero-capacity demand has an exception but no ratio.

**Handoff:** Operations uses the inherited capacity helper; Risk supplies native staffing evidence.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="approvals"></a>
## Exact-user routed approvals

**Select:** My approvals or approval follow-up.

**Required normalized evidence:** queues filtered to exact verified current routing, entity type/reference and record identity; deadline/SLA if available.

**Measures and definitions:** Count distinct currently routed records, not everyone supervised by a manager.

**Layout:** Separate approval table with state, age basis, recorded owner and follow-up.

**Evidence detail:** Approval route and request/current-user evidence; include date and permissions limits.

**Unavailable and semantic boundaries:** Open/rejected/nonapproved are not automatically pending the current user's approval or overdue.

**Handoff:** Operations; expense compliance and commercial effects stay with Financial.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="staffing"></a>
## Staffing exceptions

**Select:** Unstaffed work, placeholder assignments or assignment feasibility.

**Required normalized evidence:** tasks + separate assignment rows + complete verified resources, assignment coverage/remaining-work detail when available.

**Measures and definitions:** Unique work with no assignment, generic/mixed, inactive/ineligible, unknown identity, early end or verified missing hours. Category counts may overlap.

**Layout:** Assignment-state table with independent native coverage panel.

**Evidence detail:** Verified resource kinds/roles, relevant assignment, end-date basis and native missinghours attribution.

**Unavailable and semantic boundaries:** No prefix-only classification, task gap copied to all assignees, or named-assignee-means-capacity inference.

**Handoff:** Operations identifies facts; Risk interprets staffing exposure after native -9 intake.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="candidates"></a>
## Employee role/capacity comparison

**Select:** Find replacement or placement candidates.

**Required normalized evidence:** candidate_request + dated daily ledger + exact role ID and dated requirements; explicit price criteria only when requested.

**Measures and definitions:** Per-required-day spare capacity, exact role match and eligibility. Neutral ordering unless requested criteria exist.

**Layout:** Qualifying and excluded candidates in one traceable table with reasons and permitted rate context.

**Evidence detail:** Daily capacity, exact role identity, eligibility and price unit/currency/effective basis.

**Unavailable and semantic boundaries:** Default same-role employees only; no silent broader search. Price display is not price ranking; unknown price is not zero.

**Handoff:** Operations; Financial validates comparable prices only when relevant.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="placements"></a>
## Proposed placement scenario

**Select:** Compare several placements or distribute proposed work.

**Required normalized evidence:** Validated daily ledger and unique placement_id/resource/date/hours plus verified role match and eligibility.

**Measures and definitions:** Reserve each selected proposal once against its resource/day scenario balance, without modifying recorded work.

**Layout:** Before/proposed/after table with fits/not-established outcome and separate confirmed work.

**Evidence detail:** Each proposed consumption and earlier reservation in order; show explicit assumptions.

**Unavailable and semantic boundaries:** A second project cannot reuse already proposed spare hours. Insufficient/unknown input blocks fit; a proposal never authorizes assignment.

**Handoff:** Operations coordinates proposal and any separately approved action workflow.

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
