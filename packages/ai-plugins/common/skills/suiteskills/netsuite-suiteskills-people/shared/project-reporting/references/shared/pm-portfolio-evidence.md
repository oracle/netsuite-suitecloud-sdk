# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# PM portfolio evidence adapter — DASHBOARD-1.0.0
## Boundary
This is a local normalized input contract, not a NetSuite record schema, SQL query,
API or evidence authenticator. The domain owners map actual metadata/definitions
through the universal connector's discovered capabilities and permissions.
No NetSuite field is hard-coded as a universally valid financial measure.

Place `pm_portfolio` inside `visual_dataset.build` input `evidence` for the
`portfolio-health` profile. Include `version: DASHBOARD-1.0.0`.

## Manager and population
`manager`: `entity_type` (employee/vendor), exact `id`, permitted `display_name`,
`reference_verified: true`, `source_refs`.
`population_definition`: human-readable resolved filters.
`population_complete`: verified exhaustive directory and all pages.
`task_population_complete`: independently verified exhaustive relevant task retrieval.
`projects`: unique rows matching exactly the root authorized project scope.
A missing project row becomes a visible unknown placeholder and blocks completeness;
an extra/duplicate project or mismatched manager reference is rejected.

## Project row
`project_id`, `project_name`, permitted `client`, `manager_id`, `manager_type`,
`membership_verified`, `source_refs`.
`lifecycle`: `value` active/upcoming/closed/other/unknown and `verified`.
`plan_state`: present/absent/unknown plus `plan_state_verified`.
Do not derive lifecycle from isinactive alone or absence of joined rows.
`schedule`: start/end ISO local dates, start_verified/end_verified, end_basis
(calculated_project_end/scheduled_project_end/latest_effective_task_due), source_refs.
A task deadline does not silently become the calculated project end.

`measures`: contract_value, committed_revenue, recognized_revenue, actual_cost,
estimated_cost, planned_hours, actual_hours. Each value carries:
- `value` (decimal/string or null), `semantic`, `definition`, `source_refs`;
- `verified`, `population_complete`, `grain_verified`;
- currency/book/period/basis for money; compatible date basis for hours.
Allowed semantics respectively: contract_value; committed_revenue; recognized_revenue;
actual_project_cost or actual_labor_cost; estimated_cost; plannedwork; actual_hours.
A reconstructed actual cost with rate_kind billing is rejected. Proper upstream cost
validation must include source and historical-rate/treatment evidence, not just a flag.
Parent/child estimated task costs must be reconciled before supplying the project total.

`financial_comparison_verified` plus `financial_comparison_basis` confirms the
meaningful committed/recognized/actual comparison after matching currency/book/period.
`estimate_contract_comparison_verified` and `hours_comparison_verified` govern their
specific arithmetic. Unknown values remain null, not zero. New derived rows preserve
source references and formulas. Cross-currency totals are forbidden; known group
subtotals, evaluated denominators and unassigned-context projects are explicit.

## Risk and request coverage
Supply normal request/result ledgers and `risk_findings`, `native_input`, tasks, etc.,
through the unchanged existing contracts. A PM adapter is not a short circuit around
the complete risk sweep. Native coverage and plannedwork utilization remain separate.
Optional `risk_findings` co-occurrence and verified `project_customers` concentration
reuse resolved identities; duplicate conflicting mappings fail closed.

## Privacy
All adapter outputs remain protected VISUAL evidence until reviewed by the host and
projected through PRESENTATION-2.0.0. No raw project object, arbitrary extra fields,
credentials or account fixtures enter a reusable package. Sensitive cost/rate and
identity disclosure remains governed by the existing purpose/audience policy.
