# Checks

Use these checks after readiness establishes `TIMETRACKING` and one weekly mode. Retrieve evidence through
[connector-tools.md](connector-tools.md).

Only Actual Time counts. Planned Time and Allocated Time never count as observed minutes, presence, totals, or evidence
for these checks.

## Contents

- [Result contract](#result-contract)
- [Check IDs and scope](#check-ids-and-scope)
- [Common calculation and evidence rules](#common-calculation-and-evidence-rules)
- [Resource qualification and calendar resolution](#resource-qualification-and-calendar-resolution)
- [Missing entry values](#missing-entry-values)
- [Configured limits](#configured-limits)
- [Interpret the setting](#interpret-the-setting)
- [Resource and feature applicability](#owner-and-feature-applicability)
- [Strict comparison formulas](#strict-comparison-formulas)
- [Daily and weekly Actual Time totals](#daily-and-weekly-actual-time-totals)
- [More than 24 Actual Time hours in a day](#more-than-24-actual-time-hours-in-a-day)
- [Holiday or non-working day](#holiday-or-non-working-day)
- [Missing weekly time](#missing-weekly-time)
- [Metric separation](#metric-separation)

## Result contract

These labels describe review results, not legal or policy compliance.

| Result ID | Label | Meaning |
| --- | --- | --- |
| `exception` | Exception | Complete evidence proves a configured NetSuite rule was broken, complete evidence proves a fixed review rule defined by this skill was broken (`daily-over-24-hours` and `holiday-or-non-working-day`), or NetSuite evidence for the exact entry proves required information is missing or invalid. |
| `review-item` | Review item | Complete evidence proves a neutral fact worth review, but not a known violation of a configured rule. |
| `no-issues-found` | No issues found | Every applicable check for the target completed without an exception or review item. |
| `not-configured` | Not configured | Current NetSuite settings say the check is disabled or does not apply. |
| `could-not-check` | Could not check | Required settings, data, permissions, tools, or complete results were unavailable or invalid. |

Keep every applicable finding on a target, including an exception and a review item on the same entry. Could not check
prevents an overall No issues found result. Interpret a request to approve compliant entries through
[target selection](actions.md#normalize-the-selection), without claiming legal or policy compliance.

## Check IDs and scope

Use real check IDs in evidence and coverage. Entry findings target the real lowercase `timebill` and internal ID. Weekly
findings target a real lowercase `timesheet` or use only the owning presentation week's `reviewGroupKey`.

| Check ID | Check | Finding scope |
| --- | --- | --- |
| `missing-values` | Check readable entry values and exact requiredness evidence. | Entry |
| `entry-minimum` | Compare the verified entry duration with its applicable minimum. | Entry |
| `working-day-minimum` | Compare the relevant daily total of selected Actual Time on a proved working date. | Every affected reviewed entry |
| `working-day-maximum` | Compare the relevant daily total of selected Actual Time on a proved working date. | Every affected reviewed entry |
| `weekly-minimum` | Compare the relevant weekly total of selected Actual Time and required calendar facts. | Timesheet or week |
| `weekly-maximum` | Compare the relevant weekly total of selected Actual Time and required calendar facts. | Timesheet or week |
| `daily-actual-time-total` | Report the daily Actual Time total across all approval statuses and its coverage. | Entry |
| `weekly-actual-time-total` | Report the weekly Actual Time total across all approval statuses and its coverage. | Timesheet or week |
| `daily-over-24-hours` | Compare the daily total of selected Actual Time with 1440 minutes. | Every affected reviewed entry |
| `holiday-or-non-working-day` | Check the verified date against the effective calendar and holidays. | Entry |
| `missing-weekly-time` | Check past expected working dates within verified employee boundaries. | Timesheet or week |

Use current effective settings. They don't prove the settings in effect at creation or submission.
`Perform limit check on approval action` is informational NetSuite context, not a review input. Continue applicable
daily, weekly, and fixed review checks when it is disabled.

## Common calculation and evidence rules

- Use integer minutes returned by NetSuite or calculated from verified NetSuite data retrieved with SuiteQL. Do not
  estimate durations mentally from displayed clock text.
- Select supporting entries through the
  [connector contract](connector-tools.md#resource-calendar-holiday-and-totals-enrichment). Use the calculations
  described under [Daily and weekly Actual Time totals](#daily-and-weekly-actual-time-totals).
- Validate the complete data for the time entries used to calculate a day or week total. Time entries pending approval
  alone are not proof of a complete total.
- Keep a source, retrieval timestamp, and `complete`, `partial`, or `unavailable` coverage state for every input
  dataset.
- Mark only dependent checks `Could not check`. Do not turn missing evidence into zero, a pass, or an exception.
- Evaluate current settings only. Findings do not prove historical policy or agreement with NetSuite approval
  validation.

Include these facts in every emitted finding:

- Identify the affected real entry, real timesheet, or presentation week key and date or week.
- Show the observed value and units.
- Show the threshold or rule when applicable.
- Show the preference mode and configured `WARNING` or `ERROR` response when applicable.
- Identify the source, retrieval time, and coverage of the evidence.

## Resource qualification and calendar resolution

Apply facts in this order:

1. Establish global feature applicability.
2. Classify the resource positively.
3. Check the `Apply Time Threshold to Vendor Time` preference using
   [Resource and feature applicability](#owner-and-feature-applicability) before requiring calendar facts.
4. Resolve and validate the effective calendar and independent holiday evidence.
5. Derive the exact threshold and whether the date is a working date.
6. Evaluate employee missing time where applicable.
7. Compare complete evidence or use only the permitted conclusions from a lower bound.

Keep every time entry returned by the authoritative query for time entries pending approval even when enrichment fails.

Classify each distinct resource with time entries pending approval from complete, separate employee and vendor datasets.
A missing employee row never implies a vendor identity. Require exactly one positive match to establish employee or
vendor identity. Neither row, inaccessible or partial datasets, malformed rows, or a match in both datasets yields
`ownerKind = unknown` and `Could not check` for dependent checks while retaining the time entry.

For a positively classified resource, use its assigned `workCalendar` when the assignment and lookup of the assigned
calendar are complete and the calendar row is valid. A complete null assignment, or a complete lookup of the assigned
calendar with no matching row, permits the account default lookup. Do not fall back after partial, error, malformed, or
ambiguous assignment evidence. Require exactly one valid default calendar. Report `Could not check` for zero or multiple
defaults.

Validate every resolved calendar before using it:

- Require finite `workHoursPerDay` from 1 through 24 inclusive.
- Require all seven weekday values from Sunday through Saturday as booleans.
- Require at least one working weekday.

Track holiday coverage independently. Accept a complete empty holiday result. Incomplete holiday paging makes checks
that depend on holidays `Could not check`. Retrieve calendar facts and holiday dates without their names or
descriptions, as required by connector privacy rules.

`workingDay = configuredWeekday && !holiday`. A holiday or nonworking date skips daily minimum and maximum checks for
working days, but does not skip an entry minimum. Holidays never reduce the configured weekday count used by a weekly
threshold derived from the calendar.

## Missing entry values

Check these verified time entry fields when exposed: `Customer/Project`, service item, description/memo, location,
department, class, task, and case.

Treat `Customer/Project` as filled when either a verified project or a verified customer is present. Report the field as
empty only when the source field is confirmed empty. A missing display name or an omitted display property doesn't prove
that the source field is empty.

1. A present value produces no finding for that field.
2. An empty value is a `Review item` when requiredness is unknown.
3. Change that field result to `Exception` only when NetSuite evidence for the same account, record, form/context,
   field, and retrieval time explicitly says the value is required. General record metadata, a field label, another
   entry, account convention, or an assumption about the enabled feature is not enough.
4. If the entry or field could not be read reliably, return `Could not check` for that field. Do not call an unread
   value empty.

Requiredness evidence identifies the selected account, exact record type and internal ID, exact field, form or record
context, authoritative source/result identity, retrieval timestamp, completeness, and the requiredness value. This is an
evidence requirement, not a claim that general Standard Connector metadata supplies those facts. Requiredness that
depends on context is not reliably available through Standard Connector tools. When qualified evidence for the instance
is absent, keep the empty value as a review item and say that requiredness could not be confirmed.

## Configured limits

### Interpret the setting

Use the mode, `Value`, and `Action` from the fixed preference query. Follow
[preference validation](connector-tools.md#fixed-companypreference-query) for parsing.

- For `DISABLED`, report Not configured and ignore the stored `Value` and `Action`.
- For `ENABLED`, use the parsed `Value` in integer minutes.
- For `ENABLEDWORKCALENDAR`, ignore the stored explicit `Value` and require complete effective calendar facts.
- For missing companion rows, an unknown mode or response, malformed duration, arithmetic overflow, or incomplete
  required calendar evidence, report Could not check.

Derive an entry threshold or threshold per working day from the calendar with this formula:

```text
minutesPerDay = Math.round(workHoursPerDay * 60)
thresholdMinutes = minutesPerDay
```

Derive a weekly threshold from the calendar with this formula:

```text
thresholdMinutes = minutesPerDay × configured working-weekday count
```

Use the effective resource calendar. Do not guess a default, ignore effective dates, or subtract holidays from the
configured weekday count used to derive the weekly preference threshold. Holidays still determine whether a particular
date is a working day.

<a id="owner-and-feature-applicability"></a>

### Resource and feature applicability

For verified employees, use the effective employee calendar and exposed employment facts. For an unknown resource kind,
report Could not check for dependent rules.

For verified vendors, evaluate `Apply Time Threshold to Vendor Time` before calendar resolution:

| Value | Configured limits and fixed `daily-over-24-hours` and `holiday-or-non-working-day` rules |
| --- | --- |
| Disabled (`F`) | Report Not configured without requiring calendar facts. |
| Enabled (`T`) | Apply the rules as for employees, with the complete facts required by each check. |
| Missing, malformed, or unavailable | Report Could not check. Do not treat the preference as disabled. |

`Minimum number of hours per working day`, `Minimum number of hours per week`, and the configured
`Require time for working days` behavior apply only when `Advanced Approvals on Time Records` is enabled. Otherwise
report Not configured for those configured checks. Preserve the neutral past gap facts described under
[Missing weekly time](#missing-weekly-time).

### Strict comparison formulas

| Check ID | Observed minutes | Violation formula | Equality |
| --- | --- | --- | --- |
| `entry-minimum` | Verified entry duration | `observedMinutes < thresholdMinutes` | Not a violation |
| `working-day-minimum` | Complete total of selected Actual Time for the working date | `observedMinutes < thresholdMinutes` | Not a violation |
| `working-day-maximum` | Complete total of selected Actual Time for the working date | `observedMinutes > thresholdMinutes` | Not a violation |
| `weekly-minimum` | Complete total of selected Actual Time for the week | `observedMinutes < thresholdMinutes` | Not a violation |
| `weekly-maximum` | Complete total of selected Actual Time for the week | `observedMinutes > thresholdMinutes` | Not a violation |

Use the selected entries defined under [Daily and weekly Actual Time totals](#daily-and-weekly-actual-time-totals). A
proved violation is `Exception`. A completed comparison that does not violate the boundary contributes no exception.
`WARNING` and `ERROR` are displayed only as current configured context. Neither value proves that approval is blocked.

<a id="lower-bound"></a>

A lower bound is a subtotal calculated from verified time entries when the available data is incomplete. The full total
for the same set of entries is at least that amount.

For partial totals visible to the role, keep coverage of the required time entries separate from the comparison result.
Positive durations make a verified subtotal a lower bound. Use it only for these conclusions:

| Check | Safe partial conclusion |
| --- | --- |
| Maximum (daily or weekly) | `Exception` when the visible lower bound is already strictly above the maximum. |
| Minimum (daily or weekly) | The minimum exception is suppressed when the visible lower bound already meets or exceeds the minimum. |
| More than 24 hours | `Exception` when the visible lower bound is already above 1440 minutes. |

All other partial comparisons are `Could not check`. A partial minimum proven satisfied suppresses only that minimum
exception. Incomplete coverage still prevents an overall `No issues found` result. A lower bound never becomes an exact
total and never proves agreement with NetSuite approval validation.

Daily limit findings attach to each affected reviewed `timebill` entry for that date. Weekly limit findings appear once
on the owning real timesheet group or group for the presentation week. A finding for the presentation week uses only its
`reviewGroupKey`.

## Daily and weekly Actual Time totals

Maintain two separate calculations for Actual Time, including entries that are not pending approval when needed:

- Actual Time across all approval statuses (`timeType = 'A'` with no filter on approval status) feeds
  `daily-actual-time-total`, `weekly-actual-time-total`, and `missing-weekly-time` presence in both approval modes. When
  Advanced Approvals on Time Records is enabled, Open and Rejected entries remain in this calculation and can satisfy
  presence or contribute to a neutral total.
- Use the selected Actual Time for configured daily and weekly limit comparisons and the fixed `daily-over-24-hours`
  review rule. When Advanced Approvals on Time Records is disabled, select all Actual Time without an approval filter.
  When it is enabled, select Pending and Approved Actual Time (`approvalStatus IN (2, 3)`) and exclude Open and Rejected
  entries from these comparisons.

Both calculations exclude Planned Time and Allocated Time. Preserve duration conversion and integer minute addition when
the selected entries change. Keep coverage for each calculation separate even when both calculations use the same
entries.

| Coverage | Result | Display |
| --- | --- | --- |
| Complete retrieval of required time entries | `No issues found` for the total/coverage check. Use the exact integer minute total for dependent checks | Exact total |
| Partial retrieval of required time entries with a verified subtotal | `Could not check` for the total/coverage check. Use only the safe dependent conclusions above | `At least N` |
| No reliable evidence for a total or subtotal | `Could not check` for the total/coverage check and every dependent comparison | `Not available` |

Never display unknown as zero. State which time entries the calculation uses, their statuses, date/week bounds, and
coverage. Do not claim the review total matches the total for time entries used by NetSuite approval validation.

## More than 24 Actual Time hours in a day

Use the daily total of [selected Actual Time](#daily-and-weekly-actual-time-totals) in integer minutes. Attach the
result to every affected reviewed entry on that date, including a separate Exception on each entry when the applicable
daily total exceeds 1440 minutes.

Check [Apply Time Threshold to Vendor Time](#owner-and-feature-applicability) first.

- `observedMinutes > 1440` means `Exception`.
- `observedMinutes <= 1440` means `No issues found` from this check.
- For an incomplete daily total of selected Actual Time, report `Exception` only when its lower bound exceeds 1440.
  Report `Could not check` otherwise.

This is a fixed review rule defined by this skill, not a limit enforced by NetSuite. NetSuite Approve does not block on
it. If the same total also exceeds a configured maximum per working day, `working-day-maximum` produces its own separate
`Exception`. Keep both results.

## Holiday or non-working day

Require the complete effective resource calendar for the entry date, including effective assignment or fallback,
configured weekdays, and holidays.

Check [Apply Time Threshold to Vendor Time](#owner-and-feature-applicability) before requiring calendar facts.

- A proved holiday or other nonworking date with Actual Time means `Exception`.
- A proved working date that is not a holiday means `No issues found` from this check.
- For missing or incomplete calendar or holiday facts, report `Could not check`.

This is a fixed review rule defined by this skill, not a rule enforced by NetSuite. NetSuite Approve does not block on
it. Other configured rules produce their own separate results.

## Missing weekly time

Evaluate missing time only for employees. For a verified vendor, emit neither an `Exception` nor `No issues found` from
this check, regardless of the vendor calendar or `Apply Time Threshold to Vendor Time` setting. Keep vendor entries
pending approval in the review and apply the fixed review rules and configured limits through
`Apply Time Threshold to Vendor Time`.

After company timezone retrieval, invoke the packaged `scripts/company-date.mjs` helper exactly once per review cycle.
Retain `sourceInstant`, `companyTimeZone`, and `companyLocalDate` as evidence. Use `companyLocalDate` only as the cutoff
for past working dates for `missing-weekly-time`. Never substitute UTC, the session timezone, the agent/host/browser
date, or the dashboard display fallback. A query or helper failure makes today in the company timezone unknown. Only
`missing-weekly-time` becomes `Could not check`, and unrelated checks continue.

Evaluate only dates strictly before the current date in the NetSuite company timezone. Never evaluate today or a future
date.

For each candidate date, require these facts:

- Verify the current date in the NetSuite company timezone.
- Resolve complete effective calendar facts for that date.
- Verify employee hire and release boundaries.
- Retrieve complete Actual Time across all approval statuses for the resource and date.
- Identify the one owning timesheet or presentation week.

A candidate is a missing date only when it is within the verified resource boundary, is a scheduled working date, is not
a holiday, and has no Actual Time.

For an employee with consistent exposed dates, the inclusive employment boundary is:

```text
date >= hireDate, when hireDate is present
and
date <= releaseDate, when releaseDate is present
```

An absent endpoint is open. Missing, unreadable, or inconsistent employment dates make the dependent check
`Could not check`. Do not repair or reinterpret them.

- Any Actual Time across all approval statuses satisfies presence regardless of approval status.
- Approved time off represented by Actual Time satisfies presence.
- Planned Time and Allocated Time do not satisfy presence.
- Do not assume a separate absence source. Do not expose an absence reason.
- Missing employee boundary facts, an incomplete calendar, an unknown local date, or incomplete retrieval of Actual Time
  across all approval statuses makes the dependent employee check `Could not check`. Verified vendors are excluded
  before boundary, calendar, and checks for complete retrieval of time entries.

Result mapping:

- For a past missing date when `Require time for working days` is disabled or otherwise inapplicable, emit
  `Not configured` and a neutral `Review item` titled `No Actual Time entered`.
- For a past missing date with `Require time for working days` and `Advanced Approvals on Time Records` both enabled,
  and complete evidence, emit `Exception`. You can also emit the neutral `No Actual Time entered` review item.
- When presence is proved, emit no missing time exception or review item.
- When `Require time for working days` is missing or malformed but gap evidence is complete, emit `Could not check` for
  the requirement. You can still emit the neutral gap as a `Review item`.
- Today, future dates, and dates outside verified employment boundaries are not evaluated and emit no result from this
  check.

Emit a finding for a missing date once on its owning group:

- For a real timesheet, use scope `timesheet` and target its real lowercase `timesheet` record and internal ID.
- For a presentation week, use scope `week` and store only `reviewGroupKey`. Keep it as display context without a record
  ID or action target.

Keep the gap on its owning group without creating a placeholder entry or copying it to entries. Approval or rejection of
another entry does not resolve the gap. Keep group findings out of distinct entry metrics.

## Metric separation

Count entry findings once per distinct affected real `timebill`. Render weekly group findings separately and exclude
them from `entriesWithExceptions` and `entriesWithReviewItems`, even when their group contains entries.

Use Not configured only when settings establish inapplicability. Use Could not check when evidence is incomplete. The
Standard Connector does not reliably expose requiredness that depends on context, all time entries NetSuite uses for
time approval, or approver routing. Preserve these limits instead of guessing.
