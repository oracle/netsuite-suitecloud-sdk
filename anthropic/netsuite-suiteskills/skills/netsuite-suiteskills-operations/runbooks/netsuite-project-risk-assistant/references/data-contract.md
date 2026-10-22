# Normalized data contract

## Contents
- Purpose and limitations
- Root fields and source manifest
- Project-risk rows
- Overdue-task rows
- Hours-overage rows
- Metrics, completeness, and reconciliation
- Running and testing

## Purpose and limitations

Normalize real connector results before running `scripts/aggregate_risk.py`.
The script accepts this JSON shape, not arbitrary NetSuite response formats.
Preserve original responses, account-specific field mappings, record IDs and row
references separately. The script validates consistency, not source authenticity.

Require Python 3.10+ with the standard library and an available IANA timezone
database. If that execution environment is absent, do not claim script execution.

Never use synthetic fixtures as live account data.
Do not create example business numbers to populate a dashboard.

## Root fields and source manifest

| Field | Required content |
| --- | --- |
| `schema_version` | Integer `1` |
| `data_origin` | `live_connector` or, only for isolated tests, `synthetic_test` |
| `as_of` | Calendar snapshot date, `YYYY-MM-DD` |
| `timezone` | IANA timezone used to establish the snapshot and date boundaries |
| `scope` | Human-readable project/client/subsidiary/filter scope |
| `sources` | Nonempty object keyed by local source IDs |
| `project_risks` | List of explicitly flagged project/risk-category rows; default empty |
| `overdue_tasks` | List from an authoritative overdue-task source; default empty |
| `hour_overages` | Project- or task-grain hours rows; default empty |

For each source object provide:

| Field | Meaning |
| --- | --- |
| `category` | One supported category below |
| `status` | `complete`, `partial`, `permission_denied`, `unavailable`, or `not_requested` |
| `tool` | Actual tool name; required for complete, partial and denied calls |
| `locator` | Actual search/report ID, record locator, or query identifier |
| `call_refs` | Nonempty list of actual call/response references for complete/partial/denied calls |
| `retrieved_at` | ISO timestamp with UTC offset for complete/partial/denied calls |
| `notes` | Required explanation for any status other than complete |

Retain extra source fields such as `filters`, `pagination`, `returned_rows`,
`field_mapping`, `raw_file`, and actual `record_urls` as useful. Extra source fields
are preserved in output. Represent an undiscovered view as an unavailable manifest
entry with notes; do not invent a successful call, query identifier, or timestamp.

Supported source categories:

`deadline_projects`, `overdue_tasks`, `hour_overages`, `no_allocation`,
`native_risks`, `native_issues`, `native_summary`, `supporting`.

Use `supporting` for verified resource metadata or other supplemental record
lookups. A row must reference at least one available source in its primary category.
Only complete/partial sources may support a data row.

Mark a source complete only when retrieval and scope are complete. An accessible
query limited to one client can be complete for that client, not for the account.
The helper cannot detect an undisclosed server-side cap or an omitted page.

## Project-risk rows

Require `project_id`, `risk_type`, and `source_ids`. Use strings for stable IDs.
Map `risk_type` to the primary source category:

| Risk type | Source category |
| --- | --- |
| `deadline` | `deadline_projects` |
| `no_allocation` | `no_allocation` |
| `native_risk` | `native_risks` |
| `native_issue` | `native_issues` |

Optional fields: `project_name`, `client_id`, `client_name`,
`calculated_end_date` (`YYYY-MM-DD` or null).

Only supply native-risk/native-issue flags when the source actually identifies
an applicable current risk or unresolved issue. A historical closed issue or the
mere existence of a Project Summary row does not automatically flag a project.
The helper does not decide whether a native record is currently risk-relevant.

Deduplicate at `(project_id, risk_type)` grain. Several risk records for the same
project should be consolidated to one flag row with all source IDs; preserve the
individual cases in the raw evidence for callouts. Distinct risk categories remain
distinct rows, but the overall project union counts each project only once.

Use `no_allocation` only when the source explicitly establishes it. Do not infer
it merely because allocation records were not returned.

## Overdue-task rows

Require `project_id`, `task_id`, and `source_ids`. Use an authoritative overdue-task
source; do not pass an unfiltered task list with unknown dates and assume every
row is overdue.

Optional fields:

| Field | Mapping rule |
| --- | --- |
| `project_name`, `client_id`, `client_name`, `task_name` | Observed labels and stable client ID, or null |
| `due_date` | Relevant due date as ISO calendar date in the documented timezone, or null |
| `days_overdue` | Source-provided integer age under the same date definition, or null |
| `is_closed` | true when known completed/closed/cancelled/non-actionable; false when known active; null when not established |
| `resources` | Complete observed assignment list, explicitly empty list, or null |

Normalize account status codes and completion fields from evidence. A verified
100%-complete task must not be mapped as active merely because a stale status
label says otherwise. Reconcile such source conflicts before calling the helper;
do not invent mappings for unfamiliar status values.

The script excludes `is_closed=true` tasks. For other tasks, calculate calendar
age as `as_of - due_date`, or use `days_overdue` when the date is unavailable.
When both fields exist, require agreement; otherwise stop for reconciliation.
Exclude known ages of zero or less and report the exclusion. Retain unknown ages
only on the strength of authoritative overdue-search membership, with a warning.

If the account uses a different overdue definition (business days, a different
reference date, or time-of-day deadlines), do not mix that definition with calendar
days. Either normalize to a clearly labeled calendar-day view or use a separate
documented calculation and adapt the helper/tests. Do not silently alter semantics.

### Assignments

Set `resources=null` when a field is missing, inaccessible, truncated, or the
complete assignment list cannot be established. Set `resources=[]` only for a
verified blank/no-assignment field. Use entries shaped as:

```json
{"id": "actual-resource-id", "name": "actual-resource-label", "kind": "named"}
```

This is a schema illustration, not a record to include in analysis.

Allowed kinds are `named`, `placeholder`, and `unknown`. Confirm kinds from record
metadata, account conventions or explicit user confirmation before mapping.
Do not classify names with a hardcoded `_US_` prefix. A named/placeholder entry
requires an evidenced ID or name.

The helper uses these mutually exclusive categories:

| Condition | Category |
| --- | --- |
| Explicit empty list | `unowned` |
| Every assignment verified as a placeholder | `placeholder_only` |
| At least one verified named owner | `named_owner_present` |
| Missing list or otherwise unresolved classification | `unknown` |

Named plus placeholder/unknown assignments also increment `mixed_named_assignments`,
a subset of `named_owner_present`, not an extra staffing category. A list of
placeholders plus unknown entries is unknown, not placeholder-only.

Normalize assignment joins into a complete resource list before running. Exact
duplicate task rows are collapsed; different resource lists on the same task are
rejected as conflicting duplicates. The helper will not guess whether they are
separate assignments, snapshots or conflicting views.

## Hours-overage rows

Require `project_id`, `grain`, `planned_hours`, `actual_hours`, and `source_ids`.
Require `task_id` when `grain=task`; omit it or use null when `grain=project`.
Optional project/client label fields follow the project-risk rules.

Provide normalized nonnegative numbers or decimal strings, without thousands
separators, currency symbols or unit suffixes. Treat missing/unknown amounts as
unavailable evidence, not zero. The helper rejects nonfinite/negative/missing
values rather than quietly including them.

Use one grain per project. Do not combine project totals with constituent task
totals; the helper rejects that overlap. Exact duplicate grain records collapse.
Conflicting amounts for the same grain record must be reconciled.

Compute `actual_hours - planned_hours` using decimal arithmetic. Include only
positive values in the overage chart:

- Task grain: sum positive task deltas by project; label
  `positive_task_hour_overage`. This is not the net project variance.
- Project grain: use the project's positive total delta; label
  `net_project_hour_overage`.

Do not sum these two bases into one portfolio number. Zero planned hours do not
prevent a positive absolute overage calculation; no percentage is invented.
An overage-only search cannot establish total portfolio hours or a complete
project budget. For source-provided overage without underlying planned/actual
values, retain the source-defined metric separately; do not invent inputs.

The helper does not calculate monetary budget variance or convert currencies.
Handle those separately with explicit currency, reporting-period, rate/date, and
aggregation-basis evidence. Do not title an hours chart “cost overrun.”

## Metrics, completeness, and reconciliation

Outputs include the source manifest, coverage map, metric values with formulas
and source IDs, chart data, full observed flagged project list, eligible overdue
tasks, staffing split, late-plus-hours intersections, client exposure, warnings,
and reconciliation checks.

A category with an available source and zero eligible rows produces a zero count.
A category without accessible data produces null metric values and null charts,
not zero. Partial available sources produce observed values labeled partial.
Absence of native views still prevents claims of complete risk coverage.

The observed flagged-project union combines deadline, allocation, native
risk/issue, overdue-task and positive-hours flags. It is not the same as the
deadline-search count and not a denominator for “percent of all projects at risk.”

The late-plus-hours intersection uses deadline-flagged projects OR projects with
eligible overdue tasks, intersected with positive-hours-overage projects. It does
not establish the cause of lateness. Join and group by stable IDs; do not merge
same-named projects or clients. Exclude unresolved client IDs only from the
client rollup and report how many were omitted.

Dates/names/client mappings that conflict for the same stable project ID stop the
helper. Missing names do not become invented labels; display the ID or “Not
available.” Distinct clients sharing a name remain distinct.

Require:
`known age buckets + unknown age = staffing categories = per-project task total
= eligible overdue-task count`.

Reconciliation validates internal arithmetic, not completeness of NetSuite
retrieval or accuracy of the account-specific normalization.

## Running and testing

```bash
python scripts/aggregate_risk.py normalized.json --output metrics.json
```

Use different input/output paths. On invalid input, the CLI exits nonzero and
does not overwrite the output with invalid metrics. Keep any older output clearly
separate; do not present stale output as a successful current run.

Historical tests are external review evidence; live source normalization and rendering require separate validation.
