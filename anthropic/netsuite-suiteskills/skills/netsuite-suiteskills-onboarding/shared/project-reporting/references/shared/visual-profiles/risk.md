# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Risk visual profile

Visual dataset: `VISUAL-2.0.0`; evidence runtime: `PM-4.0.0`.

Own classification and full applicable coverage. First read native Indicators, including remaining-work coverage for staffing risk; a chart is not a narrower risk definition.

Read [presentation](../presentation.md), [visual contract](../visual-contract.md) and the existing domain/evidence rules. Source completeness and request/risk gates precede rendering. Partial results retain an explicit incomplete/limited state.

## Recipe index

- [Supported exposure overview](risk.md)
- [Native Indicator results](risk.md)
- [Overdue work aging](risk.md)
- [Assignment gap detail](risk.md)
- [Investigation search coverage](risk.md)
- [Supported combined exceptions](risk.md)
- [Client grouping](risk.md)

<a id="exposure"></a>
## Supported exposure overview

**Select:** Substantive broad risk review or explicit risk dashboard.

**Required normalized evidence:** Risk-classified findings, full root risk/request ledgers, all native intake and supporting sources.

**Measures and definitions:** Distinct affected projects versus finding count versus expected/evaluated/unavailable check counts.

**Layout:** Separate exposure table, native panel and complete coverage banner; no blended risk score.

**Evidence detail:** Trigger, applicable rule, impact/materiality basis, recorded owner, proposed response and source evidence.

**Unavailable and semantic boundaries:** High task count or old delay is not High severity. Insufficient impact is Unrated.

**Handoff:** Risk owns classification; Health coordinates combined requests; Operations/Financial supply facts.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="native"></a>
## Native Indicator results

**Select:** Explain native warnings or inspect source state.

**Required normalized evidence:** native_input for indicator_tools.select_results; include discovered types, all statuses, historical cutoff and missing transport state.

**Measures and definitions:** Native state and native severity unchanged; result count is not computed exposure.

**Layout:** Native type/status/severity/message and evaluation/modification fields; optional normalized remaining-work detail.

**Evidence detail:** Returned row, eligible timestamp, alternatives, drill-down and definition evidence; no inferred refresh.

**Unavailable and semantic boundaries:** Missing is never Green. Later Green does not replace eligible historical warning. Raw fallback covers every project.

**Handoff:** Risk; staffing investigation prioritizes native coverage -9 before ordinary capacity.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="aging"></a>
## Overdue work aging

**Select:** Explain the age/volume of overdue tasks.

**Required normalized evidence:** Normalized distinct incomplete executable leaves, verified effective end/FNLT semantics, aware cutoff/timezone.

**Measures and definitions:** Due today separate; bands 1–15 / 16–30 / 31–60 / 61–100 / 101+ days.

**Layout:** Nonoverlapping count bars, project comparison and full task table.

**Evidence detail:** Task identities, actual due field basis, exclusions, unknown due/status and local-date calculation.

**Unavailable and semantic boundaries:** Aging is neither native color reconstruction nor evidence of blocking/critical-path impact.

**Handoff:** Risk owns exposure; Health/Operations supply task evidence.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="assignments"></a>
## Assignment gap detail

**Select:** Inspect missing or unsuitable staffing.

**Required normalized evidence:** Verified task/assignment/resource identities and native coverage detail.

**Measures and definitions:** Distinct tasks with assignment exceptions; native missinghours at actual assignment/window grain separately.

**Layout:** Task-state table preserving named, generic, mixed, inactive/ineligible and unknown.

**Evidence detail:** Actual gap rows/assignment mapping; owner is separate from assignee and availability.

**Unavailable and semantic boundaries:** No name-prefix-only classification or double attribution; filtered coverage data is not all staffing issues.

**Handoff:** Operations supplies staffing facts; Risk classifies supported exposure.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="discovery-coverage"></a>
## Investigation search coverage

**Select:** Broad risk review or inspect search completeness.
**Required normalized evidence:** Frozen investigation plan, source scope/definition proof and candidate dispositions.
**Measures and definitions:** Planned/completed searches, evaluated scope members, unavailable evidence and unresolved candidates. No project × catalogue denominator.
**Layout:** Compact source/search coverage and findings tables; display filters do not alter scope.
**Evidence detail:** Method, definition, record grain, window, pages, count reconciliation and alternatives.
**Unavailable and semantic boundaries:** Complete declared searches are not an exhaustive control audit. No additional verified findings is not “no possible risks”.
**Handoff:** Risk owns applicability and candidate resolution; root owner retains every ordered request obligation.
**Fallback:** Preserve all permitted findings, source limitations and denominators in text/tables.

<a id="combined"></a>
## Supported combined exceptions

**Select:** Find projects/tasks both late and over recorded effort or approved cost.

**Required normalized evidence:** Compatible independently supported conditions with verified shared project/task links.

**Measures and definitions:** Intersection of overdue and above-plan hours; monetary combinations only from Financial same-basis evidence.

**Layout:** Intersection table with separate condition measures and sources.

**Evidence detail:** Show both definitions, grains and periods; no asserted shared cause.

**Unavailable and semantic boundaries:** Hours are not money; overlap does not prove scope failure, blocker, severity or cause.

**Handoff:** Risk explains exposure; Financial alone supplies monetary variants.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="clients"></a>
## Client grouping

**Select:** Group existing supported project findings by customer.

**Required normalized evidence:** Explicit verified project/customer links and classified findings.

**Measures and definitions:** Distinct affected projects per verified client; unknown attribution separately.

**Layout:** Count bars and exact project membership per client.

**Evidence detail:** Project/customer link evidence and affected-project identities.

**Unavailable and semantic boundaries:** No assigning risk to a customer by similar name or ranking customer importance from counts.

**Handoff:** Risk groups findings; Health owns portfolio synthesis.

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
