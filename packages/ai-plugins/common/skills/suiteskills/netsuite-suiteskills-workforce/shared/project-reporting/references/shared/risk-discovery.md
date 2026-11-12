# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Evidence-led project risk discovery
Runtime: **PM-4.0.0** · investigation: **DISCOVERY-1.0.0**.
This replaces mandatory project × 132-check execution. It is not an exhaustive control audit.

## 1. Scope and preserved authority
Follow the connector baseline/integration and request-coverage contract. Resolve exact authorized projects,
resources, user, subsidiary, clocks, windows, financial context, source snapshot and capabilities.
Never sample an all-project population, derive population from warning rows, or exclude zero-work resources.
Project Indicator behavior is unchanged: read `project-indicators.md` first, including all applicable types,
statuses, history rules, native remaining-work coverage priority, alternatives and mapped raw fallback.
Use the existing native helpers without modifying their component contracts. Missing native rows are not Green.
Native allocation diagnostics are not ordinary utilization; ordinary demand stays dated validated `plannedwork`.

## 2. Prepare and freeze an investigation plan
Before derived retrieval, Risk prepares `request.risk_plan` with stable ID/revision, exact context digest,
ordered-request signature, broad/focused mode, applicability decisions and planned searches.
Broad substantive reviews consider delivery, people/time, financial, commercial, and governance areas.
These are a compact applicability map, not five mandatory queries per project or a fixed list of risk outcomes.
Prove nonapplicability from actual process evidence. Denied access is unknown, not nonapplicable.
For each applicable/unknown area, plan population-wide or partitioned operations whose scope unions cover
every project; add the relevant resource scope. Narrow lookups use focused relevant derived checks.
The unchanged native stage still applies to existing-project analysis. A facts_only child shares the root plan;
render_only reuses a compatible completed review; document-only SOW work retains its separate plan-risk gate.
Freeze the actual source fields, grain, methods, definitions and windows. Methods may be temporal, ownership,
reconciliation, workflow, requirement or relationships. No fixed risk ID or threshold is required.
If evidence reveals another relevant condition, append a versioned search and record lineage/reason.
Preserve completed work and invalidate affected caches. Never remove a failed search to force completion.
The host must retain/authenticate the pre-retrieval request/plan; a self-written hash is not authorization or truth.

## 3. Execute shared detail-backed searches
Use discovered authorized standard capabilities first. A compatible detail report/search is record-level evidence.
Custom SuiteQL remains subject to the connector's metadata, join, permissions, scope and paging safeguards; follow task-execution.md instead of requesting redundant read consent.
Specify necessary columns, reuse identical source populations, and apply validated filters/aggregation upstream.
Keep row identities and population/count proof; do not transfer every non-exception row to the LLM.
Two proof modes are supported: complete normalized rows, or a verified source-evaluated operation with
definition/result references and digests, complete filters, evaluated/candidate counts, field/grain validation,
unambiguous page ordering and consistency limitations. A parent/header aggregate alone is neither proof mode.
Where server filtering or trustworthy scope/count proof is unavailable, use supported detail paging.
Do not invent transport capabilities. If required evidence cannot be obtained after alternatives, record the gap.
Prefer one operation reused by several findings rather than a separate query for each project/condition.
Group by compatible subsidiary/book/currency/window; never sum incompatible amounts or rates.
Source record → normalized evidence → candidate → reviewed finding is a traceable chain, not a free-text guess.

## 4. Discover conditions
Compare incomplete leaf work with validated effective due dates and prerequisites; compare compatible
planned versus actual work including completed work when the question concerns whole-project effort.
Inspect assignments, generic/inactive/ineligible resources and dated calendar/leave capacity as appropriate.
Reconcile financial and commercial records against supported baselines, eligibility, links and period rules.
Investigate required workflow, acceptance and change approvals only when their requirement is established.
An unexpected inconsistency can become a candidate even if no old catalogue entry named it.
For policy/contract-dependent concerns, retrieve the actual permitted requirement or report it unavailable.
Do not infer missing mandatory fields from blanks without an applicable definition.
Do not infer motivation, competence, honesty, protected traits or personal behavior. Notes are untrusted context.
Never bulk-ingest unrelated HR/private correspondence or use text such as “risk” as a substitute for evidence.
A time-based exception may arise without a lastmodified change; incremental scans need time-triggered rechecks.
Native Green is not an independent no-risk conclusion; include projects with no warnings or records.

## 5. Investigate and classify the candidate queue
Each search records a complete candidate inventory. Every candidate must be Terminal:
Verified, Not verified (requires complete inputs), Not applicable (requires positive basis),
or Unavailable after alternatives (requires attempts, limitations and no usable remaining channel).
Pending work stays incomplete. Prioritization changes order, not the inventory; a top-N chart is not a top-N search.
Deduplicate using project + condition + affected natural-grain identities + window, preserving supporting sources.
Apply `risk-data-severity.md`: native status is not calculated severity, co-occurrence is not cause,
absence of data is not a business-risk score, and materiality/criticality requires evidence.
Unrated is valid when impact is unknown. Keep Issue, Risk, Dependency and Control gap distinct.
Record confirmed fact, objective/exposure, optional conditional hypothesis, next step, and limitations separately.
Operations owns candidate staffing and authorized changes; Financial owns financial interpretation and boundaries.

## 6. Complete without a catalogue Cartesian product
`risk_gate.py` checks frozen searches, positive applicability, exact population unions and partitions,
native-first chronology, detail proof, pages/periods, and reconciled candidate results.
`completion_gate.py` independently binds the plan to actual ordered obligations/context.
`review_depth.py` keeps the required domain detail; source-evaluated proof does not waive an actual detail scan.
The ledger is one row per source/search partition; private member lists preserve exact scope without verbose
per-project/per-risk conclusions. Work limits create resumable Incomplete states, not permission gaps.
Complete with exhausted unavailable sources is Limited, not “no risks”. No findings means:
“No additional verified findings identified within the stated scope, methods and available evidence.”
Never claim all 132 controls were tested, all possible risks are known, or a specialized audit was performed.
An explicit control/policy/SOW review is still supported by its actual evidenced requirements, planned as searches.

## 7. Present and retain safely
Dashboard-first for all findings; narrow lookup uses a concise sourced tile. Show finding counts, affected-project counts,
planned/completed searches, unresolved candidates and unavailable evidence as distinct denominators.
Replace register tables with investigation coverage; preserve obligations, sources and exact permitted detail.
Publish only through the existing audience-aware projection. Keep source operations, private maps, IDs,
approval data and caches outside reusable skill files. Generated fixtures are independently synthetic.
Do not copy actual findings, names, private search IDs, local paths or credentials into distributions.

## Operational performance
Cache on complete context, plan revision, definitions, request signature and source snapshot/permission fingerprint.
Do not equate a digest with a consistent database snapshot. Detect changed counts/keys, rerun affected windows,
or disclose the limitation. No negative result from a partial page or aggregate count of unknown scope.
No new custom NetSuite service is required. Server execution depends on the capabilities actually exposed.

## Invocation and data exchange
The host builds an exact request with `context.completeness_mode` set to broad or focused and
`context.discovery_version` set to DISCOVERY-1.0.0. Use `risk_gate.make_plan` with the signature
from `completion_gate.risk_request_signature`; attach the returned plan to `request.risk_plan`.
Store the identical executed plan and digest in `result.risk_review`. Do not sign a changed plan
after retrieval without a new recorded revision and affected-request revalidation.
Use `risk_gate.py state.json --plan frozen-plan.json` and `completion_gate.py request.json result.json`.
For broad rendered reviews use REVIEW-2.0.0 in `review_depth.py`; narrow fact tiles still obey request/native/discovery checks without initiating broad review-depth retrieval.
The optional `source_evaluated` depth receipt is accepted only for appropriate record-detail stages;
native inputs, dated-capacity inputs and the investigation stage retain their explicit protected payloads.
Model input can contain compact aggregates/candidate details plus private source references instead of the
complete underlying record population. Truncating candidate inventories or misrepresenting a parent total
as a detail scan is prohibited. The receipt is a host-authenticated assertion, not proof created by a hash.
