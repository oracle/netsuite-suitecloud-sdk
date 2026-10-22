# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.


# Project Indicators — account-neutral developer reference
Revision: V5-SANITIZED-1. Public distribution contains no historical account results,
resource names, observed counts, tenant type identifiers or deployment credentials.

This is a sanitized technical derivative of supplied implementation material.
Field names and routes are runtime-verification candidates, not a claim of universal
availability. Apply [project-indicators.md](project-indicators.md) and the inherited
connector integration before execution.

## Data model
| `projectindicator` field | Use |
| --- | --- |
| `id` | Internal ID of the calculated result. |
| `project` | FK to `job.id`. |
| `indicatortype` | Internal-list ID; stable map below. |
| `status` | `GREEN`, `YELLOW`, or `RED`. |
| `severity`, `useractionrequired` | Non-green scan values are `WARNING` / `T`. |
| `message`, `recommendedaction` | UI text; the latter includes the deep link to the drilldown. |
| `deadline`, `createddate`, `lastmodifieddate` | Result metadata; deadline is nullable. |

Join the Project as `JOIN job j ON j.id = pi.project`. `job.entityid` is the list-visible Project ID, while `job.id` is the internal ID.

## Indicator concepts, not account constants
Discover all visible types and validate labels/definitions in the actual account.
Known concepts include expense approval, overdue tasks, planned-versus-actual
overrun, unbilled approved charges, project margin, remaining-work resource coverage,
missing time, time approval and imported-expense processing. Do not restrict discovery
to this list. No numeric type or approval-status map is bundled.

Bind optional deployment mappings to the exact account, environment, enabled release
and capability context **outside** the reusable package. A missing mapping retains raw
returned type IDs as unmapped; it does not imply Green, feature absence, or completeness.

## Canonical non-green SuiteQL projection
Use this query when a backend service needs exactly the non-green state displayed on Project Indicators.

```sql
SELECT
  pi.id AS project_indicator_id,
  pi.project AS project_internal_id,
  j.entityid AS project_id,
  j.companyname AS project_name,
  pi.indicatortype AS indicator_type_id,
  BUILTIN.DF(pi.indicatortype) AS indicator_type,
  pi.status AS indicator_status,
  pi.severity,
  pi.useractionrequired,
  pi.deadline,
  pi.createddate,
  pi.lastmodifieddate,
  pi.message,
  pi.recommendedaction
FROM projectindicator pi
JOIN job j ON j.id = pi.project
WHERE pi.status <> 'GREEN'
ORDER BY pi.indicatortype, pi.project, pi.id
```

For one Project, add `AND pi.project = :projectInternalId`; for one indicator, add `AND pi.indicatortype = :indicatorTypeId`.

This warning-only projection is not a complete inventory. Remove the non-green filter
for the all-status inventory, reconcile against independently enumerated authorized
projects and runtime type applicability, and exhaust every page. Preserve null status.
The references to parameter binds are illustrative; use only the actual tool's accepted
parameters and bounded paging. Do not dispatch this document as a tool argument.
The order is deterministic, not a historical latest-evaluation selector.

## Generic drill-down route candidates
For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.

Use the returned result's reviewed `recommendedaction` as the live link source.
Validate account origin, project binding and user permission. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.
Do not construct a real domain or project ID from this package.

## Diagnostic probe templates
(not substitutes for `projectindicator`)

```sql
-- Overdue Tasks
SELECT id, project, title, status, enddate, plannedwork, actualwork, remainingwork, allocatedwork
FROM projecttask
WHERE project = :projectInternalId
  AND status <> 'COMPLETE'
  AND enddate < CURRENT_DATE;

For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.
  AND approvalstatus IN (:openStatusId, :pendingApprovalStatusId, :rejectedStatusId);

-- Resource coverage
SELECT id, project, projecttask, allocationresource, startdate, enddate, numberhours, percentoftime
FROM resourceallocation
WHERE project = :projectInternalId;

-- Actual charges that have not been invoiced
SELECT id, billto AS project_internal_id, stage, chargedate, amount,
       invoice, transaction, projecttask, timerecord, transactionline
FROM charge
WHERE billto = :projectInternalId
  AND stage = 'READY_FOR_BILLING'
  AND invoice IS NULL
  AND transaction IS NULL;

-- Expense-report linkage
SELECT t.id AS expense_report_id, t.tranid, t.status, tl.projecttask, pt.project
FROM transaction t
JOIN transactionline tl ON tl.transaction = t.id
JOIN projecttask pt ON pt.id = tl.projecttask
WHERE t.type = 'ExpRept'
  AND pt.project = :projectInternalId;
```

Native colors/messages come from result rows; diagnostics do not recolor them.
Validate enum values, date basis, leaf-task applicability, grain and joins before use.
A broad non-approved time set is not the user's routed approval queue. Task totals
do not establish same-day/task/resource overrun. Ready/unlinked charges are candidates,
not proof of the native aging clock or Red. Expense joins require deduplication.
Margin needs compatible actual revenue and complete costs, period, book and currency.

## Native remaining-work detail
When exposed and verified, use `projecttasktimeremainingrisk` with `project`,
`projecttask`, `projecttaskassignment`, `missinghours`, `availablehours`, `remaininghours`,
`blockedhours`, `timeoffhours`, `scoringstartdate`, and `scoringenddate`.
`missinghours` is the gap, not total planned work. Keep actual assignment/window grain.
Allocation and remaining-work inputs can explain native coverage; ordinary utilization
still uses dated `plannedwork` and compatible calendars/leave only.

## Timing and permissions
`lastmodifieddate` is a freshness marker, not proven evaluation time. Keep created,
modified, retrieved and evaluated times separate. Scheduled cadence is not evidence
that an evaluation ran, and a current row cannot reconstruct deleted historical state.
Check runtime version, permissions, evaluation window and actual retention.

## Public product references
- https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_3715561461.html
- https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N1179876.html
