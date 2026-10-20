# Connector tools

Use only the Standard NetSuite AI Connector tools exposed by the selected connection. Inspect current callable schemas and response contracts before use; historical tool names and response envelopes below are examples to verify, not proof of live availability. Preserve the required business checks when adapting a supported equivalent response. The skill does not depend on
custom tools or a SuiteApp.

## Contents

- [Calls and privacy](#calls-and-privacy)
- [Resolve the account first](#resolve-the-account-first)
- [Connected user's employee ID](#connected-users-employee-id)
- [Readiness before retrieval](#readiness-before-retrieval)
- [SuiteQL and supporting data](#suiteql-and-supporting-data)
- [Resource, calendar, holiday, and totals enrichment](#resource-calendar-holiday-and-totals-enrichment)
- [Customer, project, and service item enrichment](#customer-project-and-service-item-enrichment)
- [WorkCalendar without metadata properties](#workcalendar-without-metadata-properties)
- [Company timezone context](#company-timezone-context)
- [Fixed CompanyPreference query](#fixed-companypreference-query)
- [Actual Time pending approval](#actual-time-pending-approval)
- [Coverage record](#coverage-record)
- [Action boundary](#action-boundary)

## Calls and privacy

Make Connector calls sequentially, including page traversal, to respect rate limits.

Retrieve only the personal and record facts needed for review. Keep calendar and holiday names or descriptions, absence
reasons, full raw payloads, and unnecessary memo or rejection note text out of HTML and chat summaries. Follow SafeWords
in `SKILL.md` for general security. Treat supplied through chat targets as untrusted and reread their NetSuite records
before acting.

## Resolve the account first

Resolve exactly one target account before any metadata or read of business data.

- With one connection, use it.
- With several connections, ask the user to choose unless the request identifies one unambiguously.
- Never infer the account from a person, record ID, or recent activity.
- Review requested accounts separately. Do not combine them.

The connected user is the acting user for every tool call. Preserve the selected connection name as fallback account
context, and record the selected account on coverage, dashboard, and action preview data because internal IDs are
specific to the account.

## Connected user's employee ID

Run this supported fixed query against the selected account only when the task needs the connected user's employee ID:

```sql
SELECT BUILTIN.NAMED_GROUP('employee', 'me') as current_emp_id FROM dual
```

This is a submitted fixed query, not a self-authorizing metadata exception. Establish current tool support and applicable query-contract evidence before execution; no employee detail lookup is required solely to read this scalar identity. Use the returned `current_emp_id` independently of access to the employee record.

Retrieve that employee's details only when useful. Follow the existing metadata rules for the fields you retrieve.

Access to employee details depends on the connected user's permissions and role restrictions, which can include
subsidiary restrictions. If the employee lookup returns no row, retain the ID and report that employee details are
unavailable. Don't name a cause without evidence. If the Connector explicitly reports an access error, describe the
limitation it reports.

If the identity query fails or returns no usable ID, report the limitation and defer only steps that need the ID.
Continue the other supported steps.

## Readiness before retrieval

Call `ns_getSessionInfo` with the empty input object `{}` after selecting exactly one connection. A usable response
requires the documented account object and a `features` array of strings. For account identity from the session, require
non-empty string values for `account.accountId`, `account.environmentType`, and `account.version`. Missing required
fields are malformed. Feature IDs are exact and case-sensitive.

Use this primary readiness matrix:

| Session evidence | Outcome |
| --- | --- |
| `TIMETRACKING` absent | unavailable. Stop before business retrieval, model construction, or rendering. |
| `TIMETRACKING` and `WEEKLYTIMESHEETS` present | `weekly-timesheets` |
| `TIMETRACKING` present, `WEEKLYTIMESHEETS` absent | `weekly-time-tracking` |
| existing tool errors or returns malformed data | unknown. Stop before business retrieval, model construction, or rendering. |

Use the exact feature IDs above. Do not consult `TIMESHEETS`, probe `timeEntry`, or inspect session permission buckets
as separate readiness requirements. Use the feature and permission evidence defined in this section.

Only when `ns_getSessionInfo` is unavailable or the connector reports that it is an unknown tool, run the following
fallback probes sequentially. Use these probes only with current tool support and reviewed exact packaged-query validation evidence under the pinned retrieval contract. Otherwise verify required SuiteQL metadata or stop readiness as unknown; a REST metadata call is not a substitute.

```sql
SELECT 1 FROM timebill WHERE 1 = 0
```

```sql
SELECT 1 FROM timesheet WHERE 1 = 0
```

Use this fallback matrix:

| Probe evidence | Outcome |
| --- | --- |
| `timebill` succeeds | continue to `timesheet` probe |
| exact `Record 'timebill' was not found.` | unavailable. Stop before business retrieval, model construction, or rendering. |
| any other `timebill` error | unknown. Stop before business retrieval, model construction, or rendering. |
| `timesheet` succeeds | `weekly-timesheets` |
| exact `Record 'timesheet' was not found.` | `weekly-time-tracking` |
| any other `timesheet` error | unknown. Stop before business retrieval, model construction, or rendering. |

Only the two exact messages that the record was not found carry the stated fallback meaning. A protocol/runtime error,
authentication or transport failure, malformed result, or any other query error is unknown and stops the review. The
fallback establishes account context from the connection only. It does not fabricate an account ID.

After readiness succeeds, run the [company timezone query](#company-timezone-context) immediately before the
[fixed preference query](#fixed-companypreference-query). Validate the required approval configuration before retrieving
time entries pending approval. Select the entry approval field independently of the readiness result for Weekly
Timesheets or Weekly Time Tracking.

Session or fallback readiness success permits retrieval. It does not qualify any action. Action metadata for the exact
instance remains authoritative.

## SuiteQL and supporting data

Use `ns_getSuiteQLMetadata` before authoring a query for each supporting record unless the pinned retrieval contract permits an exact, evidence-bound packaged-query validation procedure. This source alone supplies no approval of a metadata exception. Copy `FROM` targets and fields
from successful SuiteQL metadata or another verified SuiteQL contract. A raw SQL table, metadata/direct identifier, or
case conversion is not proof of SuiteQL exposure.

The two queries for Actual Time pending approval below are fixed reviewed SuiteQL contracts. Use the selected query
rather than a saved search or a direct read fallback. The selected entry approval field must be established for its applicable mode through current schema or the pinned exact-query validation procedure. Without that evidence, stop the dependent query; do not invent a metadata exception. Supporting queries still require successful
metadata or another verified contract for other fields and records. If a supporting field cannot be proved, mark only
the dependent retrieval or check unavailable.

Bound queries by selected IDs and dates and select only needed fields. Use bind parameters for user values when the
interface supports them. `ns_runCustomSuiteQL` exposes only a query string. Use fixed reviewed literals or strictly
validated IDs and dates with proved fields and exposure. Do not concatenate user text into SQL. Report the gap when a
value cannot be inserted safely.

For results that can have multiple pages, call `ns_runCustomSuiteQL` with `pageSize: 1000` and `pageIndex: 0`, read
`totalResults` and `numberOfPages`, then request every page through `numberOfPages - 1`. Validate each successful page:

- Reject MCP protocol failures, `isError`, or a top-level `error`.
- Require `method: "custom_suiteql"` and a `data` array.
- Require `resultCount` to equal that page's `data.length`.
- Require the requested `pageIndex`, non-negative `totalResults`, and non-negative `numberOfPages`.
- Check any paging flags against the page position.

Deduplicate stable IDs after all pages. Coverage is complete only when every declared page succeeded and the final
distinct results are consistent with the qualified query. Any top-level SuiteQL `error`, invalid shape, missing page,
changing page count, or total mismatch makes the result partial or unavailable. Never turn it into zero.

### Resource, calendar, holiday, and totals enrichment

The resource for a time entry pending approval can be an employee or vendor. Retrieve separate batched `Employee` and
`Vendor` datasets for distinct resource IDs, then classify through checks. Keep employee boundaries separate from
calendar assignments so an unavailable boundary field does not discard usable assignment evidence.

Normalize and deduplicate trusted nonzero signed base-10 internal IDs before creating batches. Use batches of at most
500 nonzero signed base-10 IDs and SuiteQL pages of 1000. Empty batches never emit `IN ()`. Validate dates as real
dates, then serialize each as `YYYY-MM-DD`. Interpolate values only from fixed reviewed literals or validated values
returned by the selected account. Batch retrieval rather than running a query inside an entry, resource, or calendar
loop. Track coverage by dataset, batch, and date window. A failed batch affects only dependent resources.

Run calls and page traversal sequentially. Deduplicate assigned calendar IDs globally, query the account default
calendar at most once per retrieval cycle, and run holidays and the selected supporting time queries below in batches
over one combined date range for the review. Join all returned maps locally. Deduplicate rows for time entries pending
approval and totals by `timebill_id`, resource and calendar rows by ID, and holidays by the stable composite within the
account `(calendar_id, holiday_date)`. `WorkCalendarHoliday` has no standalone holiday ID.

Keep the separate queries instead of combining them in one join or an Employee/Vendor `UNION`. A join can multiply rows
and hide which dataset had a permission or paging failure. Local joins preserve row identity, independent coverage, and
the authority of the query for time entries pending approval.

The following fixed projections are the only supporting contracts for this enrichment:

Read Employee identity and calendar assignment once per validated resource batch:

```sql
SELECT
  e.id AS owner_id,
  e.workCalendar AS work_calendar_id
FROM Employee e
WHERE e.id IN (<VALIDATED_OWNER_ID_LITERALS>)
ORDER BY e.id
```

Read Vendor identity and calendar assignment once per validated resource batch:

```sql
SELECT
  v.id AS owner_id,
  v.workCalendar AS work_calendar_id
FROM Vendor v
WHERE v.id IN (<VALIDATED_OWNER_ID_LITERALS>)
ORDER BY v.id
```

Read confirmed employee employment boundaries with one query per validated Employee batch:

```sql
SELECT
  e.id AS owner_id,
  e.firstName AS first_name,
  e.lastName AS last_name,
  e.entityId AS entity_id,
  e.hireDate AS hire_date,
  e.releasedate AS release_date
FROM Employee e
WHERE e.id IN (<VALIDATED_EMPLOYEE_ID_LITERALS>)
ORDER BY e.id
```

Read assigned WorkCalendar facts once per batch of globally deduplicated calendar IDs:

```sql
SELECT
  c.id AS calendar_id,
  c.isDefault AS is_default,
  c.workHoursPerDay AS work_hours_per_day,
  c.sunday AS sunday,
  c.monday AS monday,
  c.tuesday AS tuesday,
  c.wednesday AS wednesday,
  c.thursday AS thursday,
  c.friday AS friday,
  c.saturday AS saturday
FROM WorkCalendar c
WHERE c.id IN (<VALIDATED_CALENDAR_ID_LITERALS>)
ORDER BY c.id
```

Read default WorkCalendar facts at most once per retrieval cycle:

```sql
SELECT
  c.id AS calendar_id,
  c.isDefault AS is_default,
  c.workHoursPerDay AS work_hours_per_day,
  c.sunday AS sunday,
  c.monday AS monday,
  c.tuesday AS tuesday,
  c.wednesday AS wednesday,
  c.thursday AS thursday,
  c.friday AS friday,
  c.saturday AS saturday
FROM WorkCalendar c
WHERE c.isDefault = 'T'
ORDER BY c.id
```

Read WorkCalendarHoliday dates over the combined date range for the review:

```sql
SELECT
  h.workCalendar AS calendar_id,
  h.exceptionDate AS holiday_date
FROM WorkCalendarHoliday h
WHERE h.workCalendar IN (<VALIDATED_CALENDAR_ID_LITERALS>)
  AND h.exceptionDate >= TO_DATE('<START_YYYY_MM_DD>', 'YYYY-MM-DD')
  AND h.exceptionDate <= TO_DATE('<END_YYYY_MM_DD>', 'YYYY-MM-DD')
ORDER BY h.workCalendar, h.exceptionDate
```

When Advanced Approvals on Time Records is disabled, read all Actual Time over the same combined date range:

```sql
SELECT
  id AS timebill_id,
  employee AS owner_id,
  tranDate AS entry_date,
  hours AS duration,
  supervisorApproval AS approval_status,
  timeType AS time_type
FROM TimeBill
WHERE timeType = 'A'
  AND employee IN (<VALIDATED_OWNER_ID_LITERALS>)
  AND tranDate >= TO_DATE('<START_YYYY_MM_DD>', 'YYYY-MM-DD')
  AND tranDate <= TO_DATE('<END_YYYY_MM_DD>', 'YYYY-MM-DD')
ORDER BY employee, tranDate, id
```

Use these entries without an approval filter for presence, neutral totals, configured daily and weekly limit
comparisons, and the fixed `daily-over-24-hours` review rule. Keep coverage for each dependent calculation even when
they share the same query result.

When Advanced Approvals on Time Records is enabled, read all Actual Time for presence and neutral totals:

```sql
SELECT
  id AS timebill_id,
  employee AS owner_id,
  tranDate AS entry_date,
  hours AS duration,
  approvalStatus AS approval_status,
  timeType AS time_type
FROM TimeBill
WHERE timeType = 'A'
  AND employee IN (<VALIDATED_OWNER_ID_LITERALS>)
  AND tranDate >= TO_DATE('<START_YYYY_MM_DD>', 'YYYY-MM-DD')
  AND tranDate <= TO_DATE('<END_YYYY_MM_DD>', 'YYYY-MM-DD')
ORDER BY employee, tranDate, id
```

In both modes, use all Actual Time without an approval filter for `missing-weekly-time` presence,
`daily-actual-time-total`, and `weekly-actual-time-total`. When Advanced Approvals on Time Records is enabled, Open,
Approved, Pending, and Rejected Actual Time remain eligible for these calculations. Planned and Allocated Time remain
excluded by `timeType = 'A'`.

When Advanced Approvals on Time Records is enabled, read Pending and Approved Actual Time over the same combined date
range:

```sql
SELECT
  id AS timebill_id,
  employee AS owner_id,
  tranDate AS entry_date,
  hours AS duration,
  approvalStatus AS approval_status,
  timeType AS time_type
FROM TimeBill
WHERE timeType = 'A'
  AND employee IN (<VALIDATED_OWNER_ID_LITERALS>)
  AND approvalStatus IN (2, 3)
  AND tranDate >= TO_DATE('<START_YYYY_MM_DD>', 'YYYY-MM-DD')
  AND tranDate <= TO_DATE('<END_YYYY_MM_DD>', 'YYYY-MM-DD')
ORDER BY employee, tranDate, id
```

Use this separate Pending and Approved Actual Time for configured daily and weekly limit comparisons and the fixed
`daily-over-24-hours` review rule only when Advanced Approvals on Time Records is enabled. Preserve duration conversion,
integer minute sums, thresholds, strict comparisons, and each rule's applicability. Select different entries without
changing the arithmetic.

Keep rows used for calculations separate from time entries pending approval and action targets. Track coverage for each
selected query, batch, and date window independently. A complete result covers only time entries visible to the role for
the requested resource and dates. Do not claim agreement with NetSuite approval totals. If a selected query fails,
report its retrieval limitation through the existing coverage procedure instead of substituting the other approval field
or treating the result as empty. Preserve verified partial results and existing conclusions from lower bounds when
paging is incomplete.

### Customer, project, and service item enrichment

Resolve non-null `TimeBill.customer` IDs with separate job and customer lookups. Keep the datasets separate rather than
inferring one type from an absent row in the other:

```sql
SELECT
  j.id AS job_id,
  j.companyName AS project_name,
  j.customer AS parent_customer_id
FROM job j
WHERE j.id IN (<VALIDATED_CUSTOMER_FIELD_IDS>)
ORDER BY j.id
```

```sql
SELECT
  c.id AS customer_id,
  c.companyName AS customer_name
FROM customer c
WHERE c.id IN (<VALIDATED_CUSTOMER_FIELD_IDS_AND_PARENT_IDS>)
ORDER BY c.id
```

Read service item names:

```sql
SELECT i.id AS item_id, i.itemId AS item_name
FROM item i WHERE i.id IN (<VALIDATED_ITEM_IDS>) ORDER BY i.id
```

Map resolved names and populated but unresolved values through the
[display field instructions](output.md#display-fields).

### WorkCalendar without metadata properties

When WorkCalendar metadata returns no properties, use the fixed WorkCalendar projection with `WHERE 1 = 0` as its
capability probe. A successful execution of the fixed projection with zero rows is capability evidence that the record
is queryable. Use populated metadata when available. WorkCalendarHoliday metadata can expose `workCalendar`,
`exceptionDate`, and `description`, but the fixed query omits description. Employee metadata can expose `workCalendar`,
`hireDate`, and lowercase `releasedate`. Vendor metadata can expose `workCalendar`.

When WorkCalendar metadata has no properties, execute the fixed zero-row probe once per account/session or retrieval
cycle:

```sql
SELECT
  c.id AS calendar_id,
  c.isDefault AS is_default,
  c.workHoursPerDay AS work_hours_per_day,
  c.sunday AS sunday,
  c.monday AS monday,
  c.tuesday AS tuesday,
  c.wednesday AS wednesday,
  c.thursday AS thursday,
  c.friday AS friday,
  c.saturday AS saturday
FROM WorkCalendar c
WHERE 1 = 0
```

Use the fixed probe only after exact packaged-query validation authority and current tool requirements are established. Empty properties alone are not sufficient authorization; without supporting evidence mark this dataset unavailable. If the fixed probe
fails, the WorkCalendar dataset is unavailable. Do not fall back to reads per resource or direct reads of records. Cache
only capability evidence, not business rows. Read metadata first for WorkCalendarHoliday and Employee/Vendor fields. If
a required field or probe fails, mark only the dependent dataset or check unavailable and preserve time entries pending
approval.

## Company timezone context

The fixed `time-zone-context` dataset supplies execution/display context, not check configuration. It retrieves only the
company timezone value. It retrieves no session timezone and performs no date conversion.

Keep this fixed timezone query unchanged. General preferences returned by `ns_getSessionInfo` do not replace it.

Use this exact fixed query immediately before the CompanyPreference settings query:

```sql
SELECT
  p.value AS company_time_zone
FROM CompanyPreference p
WHERE p.preference = 'TIMEZONE'
```

Request it with `pageSize: 1000` and `pageIndex: 0`. A valid response has exactly one page and exactly one row. Require
the exact `company_time_zone` alias, a nonblank raw string value, and consistent
`data.length = resultCount = totalResults = 1`. Preserve the raw value exactly as evidence. A missing row, duplicate
row, paginated response, malformed response, or response with inconsistent counts makes the timezone context
unavailable. Never substitute a different preference or a derived value.

A failed context query leaves timezone context unavailable. Retrieval of time entries pending approval and unrelated
checks remain valid. Use the procedure to derive the company date in [checks.md](checks.md#missing-weekly-time).

## Fixed CompanyPreference query

The submitted `CompanyPreference` query is a candidate fixed contract. Establish its target and fields through current SuiteQL metadata or the pinned exact packaged-query validation procedure; this source claim does not establish current verification. Inspect the actual response and permissions each time.
The fixed contract does not guarantee access for every role or account.

Run the fixed 22-setting query after readiness and immediately after the company timezone query, before retrieving time
entries pending approval. Keep both queries unchanged. General session preferences do not replace them.

For Approve and Reject requests, follow [actions.md](actions.md#tools-and-targets) for preparation before each preview
and [Refresh and execute](actions.md#refresh-and-execute) for retaining settings during execution and refreshing them
before the final summary. Keep the response validation below at both refresh points. Report final lookup limitations and
changed settings through [recovery.md](recovery.md#verify-and-refresh), preserving known action outcomes.

Query only these 22 settings and the separate fixed timezone preference. Use this fixed bounded query without user
input:

```sql
SELECT preference, value
FROM CompanyPreference
WHERE preference IN (
  'TIMELIMITWEEKMIN',
  'TIMELIMITWEEKMINVALUE',
  'TIMELIMITWEEKMINACTION',
  'TIMELIMITWEEKMAX',
  'TIMELIMITWEEKMAXVALUE',
  'TIMELIMITWEEKMAXACTION',
  'TIMELIMITDAYMIN',
  'TIMELIMITDAYMINVALUE',
  'TIMELIMITDAYMINACTION',
  'TIMELIMITDAYMAX',
  'TIMELIMITDAYMAXVALUE',
  'TIMELIMITDAYMAXACTION',
  'TIMELIMITENTRYMIN',
  'TIMELIMITENTRYMINVALUE',
  'TIMELIMITENTRYMINACTION',
  'REQUIRETIMEFORWORKINGDAYS',
  'APPLYTIMETHRESHOLDTOVENDORTIME',
  'PERFORMLIMITCHECKONAPPROVALACTION',
  'TIMEAPPROVALS',
  'ADVANCEDTIMEAPPROVALS',
  'CUSTOMAPPROVALTIMEENTRY',
  'CUSTOMAPPROVALTIMEBILL'
)
ORDER BY preference
```

Call it with `pageSize: 1000` and `pageIndex: 0`. The allowlist has 22 names of preferences, so a valid result cannot
require another page. Still inspect `error`, `data`, `resultCount`, `totalResults`, `numberOfPages`, and `hasNextPage`.
Any second page, duplicate name, unknown name, or count inconsistency makes the preference result invalid. Validate its
shape through the paging contract above. A missing allowlisted row means that setting is unavailable, not disabled and
not false.

Treat Require Approvals on Time Records and Advanced Approvals on Time Records as supported preferences. Accept only
`'T'` or `'F'` for `TIMEAPPROVALS` and `ADVANCEDTIMEAPPROVALS` in a valid preference response.

Apply the following decisions during review or action preparation. Use the final refresh handling above when execution
has finished or stopped.

- If `TIMEAPPROVALS = 'F'`, end before pending retrieval, checks, model construction, or rendering. Explain the result
  with the message below. This outcome doesn't require `ADVANCEDTIMEAPPROVALS` and isn't a completed review with no time
  entries pending approval.
- If `TIMEAPPROVALS = 'T'`, require a valid `ADVANCEDTIMEAPPROVALS` value before selecting the pending query. Use
  `supervisorApproval` for `'F'` and `approvalStatus` for `'T'`.
- If the preference response is invalid, `TIMEAPPROVALS` is unavailable or malformed, or required
  `ADVANCEDTIMEAPPROVALS` is unavailable or malformed, explain that the approval configuration couldn't be determined.
  Stop before selecting a pending query, checks, model construction, or rendering. Report the limitation instead of
  inventing a value or switching approval fields.

```text
Require Approvals on Time Records is disabled for this account, so an approval review doesn't apply.
```

| Preference name and context | Internal ID |
| --- | --- |
| `Minimum number of hours per week` | `TIMELIMITWEEKMIN` |
| `Value` for `Minimum number of hours per week` | `TIMELIMITWEEKMINVALUE` |
| `Action` for `Minimum number of hours per week` | `TIMELIMITWEEKMINACTION` |
| `Maximum number of hours per week` | `TIMELIMITWEEKMAX` |
| `Value` for `Maximum number of hours per week` | `TIMELIMITWEEKMAXVALUE` |
| `Action` for `Maximum number of hours per week` | `TIMELIMITWEEKMAXACTION` |
| `Minimum number of hours per working day` | `TIMELIMITDAYMIN` |
| `Value` for `Minimum number of hours per working day` | `TIMELIMITDAYMINVALUE` |
| `Action` for `Minimum number of hours per working day` | `TIMELIMITDAYMINACTION` |
| `Maximum number of hours per working day` | `TIMELIMITDAYMAX` |
| `Value` for `Maximum number of hours per working day` | `TIMELIMITDAYMAXVALUE` |
| `Action` for `Maximum number of hours per working day` | `TIMELIMITDAYMAXACTION` |
| `Minimum number of hours per time entry` | `TIMELIMITENTRYMIN` |
| `Value` for `Minimum number of hours per time entry` | `TIMELIMITENTRYMINVALUE` |
| `Action` for `Minimum number of hours per time entry` | `TIMELIMITENTRYMINACTION` |
| `Require time for working days` | `REQUIRETIMEFORWORKINGDAYS` |
| `Apply Time Threshold to Vendor Time` | `APPLYTIMETHRESHOLDTOVENDORTIME` |
| `Perform limit check on approval action` | `PERFORMLIMITCHECKONAPPROVALACTION` |
| `Require Approvals on Time Records` | `TIMEAPPROVALS` |
| `Advanced Approvals on Time Records` | `ADVANCEDTIMEAPPROVALS` |
| `Time Entries`, Approval Routing | `CUSTOMAPPROVALTIMEENTRY` |
| `Time Bills`, Approval Routing | `CUSTOMAPPROVALTIMEBILL` |

The first 20 settings are under Time & Expenses, Time Tracking. `Value` and `Action` belong to the named parent setting.
`Time Entries` supplies approval routing context and does not enable retrieval of `timeEntry` records. `Time Bills`
supplies approval routing context for Actual Time and does not prove action availability. Use fresh action metadata to
qualify a target.

Validate each value without treating an absent row as false. Accept only `T` or `F` for boolean settings and `DISABLED`,
`ENABLED`, or `ENABLEDWORKCALENDAR` for limit modes. For enabled limits, accept only `WARNING` or `ERROR` for the
configured response. For an enabled explicit value, require decimal hour digits, one colon, and exactly two minute
digits from `00` through `59`. Convert `HH:MM` with `thresholdMinutes = HH × 60 + MM` and reject arithmetic overflow.
Keep missing and malformed companion values distinguishable and mark only dependent checks unavailable. Interpret
disabled settings through checks, which ignores their stored `Value` and `Action`. Interpret disabled modes and
applicability in [checks.md](checks.md#configured-limits).

`Perform limit check on approval action` describes NetSuite validation during Approve, not Reject. It does not control
retrieval, findings, comparison, or coverage for the review checks. Record the raw value or retrieval failure so output
can derive its informational coverage item.

## Actual Time pending approval

Require a valid [approval configuration](#fixed-companypreference-query) with `TIMEAPPROVALS = 'T'` before retrieving
time entries pending approval visible to the connected role. Select one of these fixed queries from
`ADVANCEDTIMEAPPROVALS`.

When Advanced Approvals on Time Records is disabled (`ADVANCEDTIMEAPPROVALS = 'F'`), use this query:

```sql
SELECT
  id AS timebill_id,
  employee AS owner_id,
  tranDate AS entry_date,
  hours AS duration,
  supervisorApproval AS approval_status,
  timeType AS time_type
FROM TimeBill
WHERE timeType = 'A'
  AND supervisorApproval = 'F'
ORDER BY tranDate ASC, id ASC
```

When Advanced Approvals on Time Records is enabled (`ADVANCEDTIMEAPPROVALS = 'T'`), use this query:

```sql
SELECT
  id AS timebill_id,
  employee AS owner_id,
  tranDate AS entry_date,
  hours AS duration,
  approvalStatus AS approval_status,
  timeType AS time_type
FROM TimeBill
WHERE timeType = 'A'
  AND approvalStatus = 2
ORDER BY tranDate ASC, id ASC
```

The complete paged result is authoritative for which time entries pending approval are visible through SuiteQL and
included in the review in this iteration. `timeType = 'A'` means Actual Time. The `approval_status` alias contains the
selected native entry value, `supervisorApproval` when Advanced Approvals on Time Records is disabled, or
`approvalStatus` when it is enabled. `supervisorApproval = 'F'` selects unapproved entries. `approvalStatus = 2` selects
Pending entries according to [enums.md](enums.md). Inclusion in the results does not prove that the connected user is
eligible to approve a returned time entry. No standard tool predicate currently reproduces NetSuite approver routing.
Keep that limitation explicit and let NetSuite action metadata and business rules decide whether an approval succeeds.

Follow the paging and SQL validation instructions above. Qualify actions separately through [actions.md](actions.md).

## Coverage record

Keep a retrieval ledger for every dashboard build:

- Record the selected account and connection label.
- Record readiness source, `session` or `fallback`, exact feature evidence or probe outcome, and selected weekly mode.
- Record the tool, interface, and verified query identity for each dataset.
- Record requested pages and ranges, returned and distinct counts, and failed pages.
- Record retrieval time and `complete`, `partial`, or `unavailable` status.
- Identify checks and metrics affected by missing data.

For `time-zone-context`, also retain the raw value and availability. Preserve unrelated retrieval and checks when this
context fails.

## Action boundary

Read [actions.md](actions.md) for global tool discovery and qualification of exact instances. Read
[recovery.md](recovery.md) for result inspection. Read [checks.md](checks.md) to classify the retrieved facts.
