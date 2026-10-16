# EX-11 · Planned-Absence Availability

Use for upcoming planned-absence availability by supervisor team. Coverage includes absences of every time-off type unless the user explicitly asks for one type. Project-assignment analysis is out of scope.

## Required retrieval contract

For each requested date or date range, retrieve all pages of `timeoffrequest` records using explicit inclusion queries: Approved to establish confirmed-request scope and Pending for a separate potential scenario. Do not filter either population by time-off type unless the user explicitly requests a type; coverage considers every absence, including sick leave. Retrieve employee ID, start date, end date, approval status, request ID when needed for an authorized individual drill-down, and `creationdate` when exposed. For the approved population, retrieve `timeoffchange` records of type `USAGE` within the date boundary and use their applied dates for confirmed absence. Retrieve an as-of active employee roster with employee ID, direct supervisor, and department only when needed as context or to honor the requested scope.

Exclude active employees without a time-off plan from coverage denominators and state the excluded count without naming them. Read [RETRIEVAL](../../references/domain-shared/contracts/RETRIEVAL.md) and [OUTPUT-MODES](../../references/domain-shared/communication/OUTPUT-MODES.md).

## Overlap-period analysis

The requested range is a search boundary, not a single aggregation bucket. Analyze active direct-report teams only; do not create department overlap findings. For a named department request, use that attribute only to set the requested employee scope, then report the supervisor-team overlap within it. Job title is not an analysis grouping or scope dimension. The expiry-only primary-type default never applies to this coverage analysis.

1. Build approved daily absence sets from `USAGE` Time-Off Changes, using their applied dates within the requested boundary. Deduplicate each employee within the same team and date. Do not expand an approved request across its start and end dates: a request may include a non-working day for which NetSuite wrote no `USAGE` record.
2. Find dates where two or more direct reports of the same supervisor are approved absent at the same time. Segment qualifying dates whenever the approved absent headcount changes; do not merge contiguous dates with different severity or dates between the qualifying periods.
3. Within each overlap period, deduplicate an employee only inside that period. An employee absent in two separate periods is counted in both; two requests in one period count once. A single person absent alone is not an absence concentration at any date or granularity.
4. Report each period with its dates, active eligible count, approved absent count, remaining count, and affected rate. A team may have ragged requests: one person absent across a week and two more absent on its final day is a three-person overlap on that day only.
5. Evaluate each pending request against the dates it would newly affect, including other same-date pending requests in a separate potential scenario. Pending requests have no `USAGE` record, so use their requested span. Report a potential overlap period when pending time creates or increases a same-date concentration. Keep approved, pending, and potential-total counts visibly separate; never fold pending into the approved count.

A range-level total such as “13 of 29 employees have time booked this quarter” is a time-off usage observation, not an absence concentration. If relevant to the question, label it that way and do not use it to rank coverage.

In Portfolio mode, evaluate direct-supervisor teams for overlap periods and rank periods by their affected rate, not by range totals. In Group mode, evaluate the relevant supervisor teams within the requested scope. A supervisor group is the active direct reports of that supervisor and excludes the supervisor from its denominator and absent count. If the supervisor is absent during a reported period, present that as an adjacent source fact. A department may be shown as context for a supervisor team; name more than one only when the team genuinely spans departments.

Do not mention rejected, canceled, or withdrawn requests unless the user asks how the count was determined. For a historical pattern request, assess whether requests are repeatedly created after their absence start date when `creationdate` is available. A systematic pattern is a data-trust limitation for the requested historical analysis; state the dates and population basis without attributing a reason or fault to employees, supervisors, or HR staff.

Read [ANALYTICS-GUARDRAILS](../../references/domain-shared/contracts/ANALYTICS-GUARDRAILS.md) before presenting a concentration finding.

## Checks

- Confirm the roster's effective/as-of basis covers the requested period, or state that the analysis uses a current roster snapshot.
- Confirm that every time-off type is included unless the user explicitly requested a type-specific coverage view.
- Keep each supervisor team separate. Do not generate department overlap rows or job-title analysis.
- For groups with fewer than four active people, do not report a Portfolio concentration finding. If the user named the group, show its total, absent, and remaining counts as context without a risk label.
- Provide individual names only when necessary and authorized; otherwise report aggregated groups. For coverage, offer affected-employee detail only for a named team; do not offer a supervisor breakdown or contact list because the result is already grouped by supervisor.

## Response shape

```
Planned-absence availability for [search boundary]:

| Supervisor team | Department | Overlap period | Approved absent | Eligible | Remaining | Affected rate |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| ... | ... | 2-6 Nov | ... | ... | ... | ... |

Potential overlap periods: [same measures, separately, if present].
| Supervisor team | Department | Overlap period | Approved absent | Pending employees | Potential total | Eligible | Remaining if pending approved |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| ... | ... | 2-6 Nov | ... | ... | ... | ... | ... |

Nothing stands out from the company pattern: [when applicable].
Drill-down available for a named team: affected employees.
Limitation: [roster, schedule, or historical-recording limitation, if applicable].
Retrieved: [timestamp].
```

Use `absence concentration` or `potential absence concentration` for a reported pattern. Do not describe a supervisor, team, or employee as the cause of the pattern.
