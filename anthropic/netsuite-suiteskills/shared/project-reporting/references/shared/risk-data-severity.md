# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Risk facts, exposure, classification and treatment
## Normalize evidence
Retain source row/field IDs, raw values/text, project/task/assignment, observed/evaluated timestamp, as-of/window, category, affected objective, owner/unblocker if recorded, controls and their operating state, indicator identity/status/configuration, source/calculation, completeness and mapping rationale.
Lifecycle type is separate from category: Risk (uncertain event), Issue (occurred condition), Dependency, Assumption, Decision, Change, Control, or Evidence gap. A breached indicator is evidence, not automatically a future risk.

Separate four layers:
1. Observed fact, such as an incomplete task past its recorded due date.
2. Current exposure, tied to a supported objective/obligation.
3. Explicitly requested conditional hypothesis, describing a possible consequence under testable assumptions.
4. Proposed response, with rationale and evidence limits, or a separately recorded authorized action.

## No invented severity
Use an applicable configured severity/impact matrix only with its version, thresholds and actual input values. Do not invent probabilities or impact scores.
Without a matrix, High requires a verified trigger plus evidenced criticality/materiality: a contractual/customer-critical/critical-path prerequisite, statutory obligation or breached approved materiality threshold. Medium requires evidenced meaningful operational/commercial impact; Low requires a verified recoverable hygiene condition. Otherwise use Unrated with the precise missing basis.
Native Red/Yellow/Green remains source status. Neither automatically becomes High/Medium/Low. Do not escalate merely because data is absent, a record is old without a freshness policy, or an executive would find it interesting.
Evidence confidence (Complete/Partial/Conflicting) is not severity or probability. Residual exposure requires evidenced implemented controls and operating results; a planned mitigation does not reduce it.
Classify a historical breach as current only when unresolved consequences or persistence are evidenced.

## Deduplication without hiding corrections
Use project + underlying condition/rule + affected natural-grain record(s) + relevant window as a stable finding key. Prefer the Project Indicator as the first indication; then the first compatible report/raw-record indication. Keep source evidence and all supporting search/requirement references.
Do not select the oldest warning over a newer eligible clearing result. Later contradictory evidence is a conflict to resolve, not an audit-only detail to suppress. Preserve first discovery provenance while allowing current state to be corrected.
Merge repeated symptoms into a correlation group only with support; do not manufacture causal chains. One shared dependency can affect multiple projects, but each project retains its attributed exposure and coverage row.

## Hypotheses only on explicit request
Start from an observed signal; state “If [testable non-human condition], then [possible objective impact]”. List assumptions, evidence that would strengthen/weaken the hypothesis, and unknowns. Never infer motivation, reliability or behavior, supply numerical likelihood, guarantee completion, or simulate financial forecasts.
No signal plus missing access is an information gap, not a new hypothetical risk.

## Response selection
Choose one proportionate evidence-linked next step before listing alternatives:
- Finance setup/linkage/recognition issue → Financial facts, then a human financial decision or authorized nontransaction governance correction.
- Recorded critical-path/dependency problem → Health schedule facts, then Operations for a supported change.
- Capacity/role gap → Operations; only that skill names/ranks candidates.
- Calendar/configuration mismatch → validate the source setting before proposing reallocation.
- Missing/incorrect entry or approval → Operations' exact work queue and current authorized owner.
Preserve the preferred-solution intent from v15, without assuming a condition label proves the response is appropriate.
A recommendation, record change, source refresh and proven resolution are distinct states. A requested change can use an applicable supported workflow under the shared action contract. Verify changed facts before claiming resolution. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.