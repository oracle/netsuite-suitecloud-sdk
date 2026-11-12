# Output

Read this reference before constructing the dashboard model. Build one self-contained HTML document with the packaged
renderer, then present that same document through the host's observed capability.

## Contents

- [Construct the model](#construct-the-model)
- [Accounts and dates](#accounts-and-dates)
- [Identity and grouping](#identity-and-grouping)
- [Findings and associations](#findings-and-associations)
- [Calendar evidence and evidence for totals](#calendar-evidence-and-evidence-for-totals)
- [Metrics and coverage](#metrics-and-coverage)
- [Vendor applicability](#vendor-applicability)
- [Display fields](#display-fields)
- [Action requests](#action-requests)
- [Validate and render](#validate-and-render)
- [Known validation limits](#known-validation-limits)
- [Present the generated file](#present-the-generated-file)

## Construct the model

Complete retrieval, coverage decisions, business facts, and classifications before rendering. Discover action tools and
qualify records only for a requested action through [actions.md](actions.md).

Read `assets/dashboard-model.schema.json` for exact fields, required properties, and accepted values. Read
`scripts/dashboard-model.mjs` for semantic relationships and generated messages. These files define the model contract.
They don't replace [checks.md](checks.md) for business classifications.

Construct the complete model yourself. Use schema `5.0`, template version `3.0.0`, `scope.kind: "pending_actual_time"`,
and the account-wide `scope.weeklyTimeMode` established by readiness. Include all required top-level fields and required
empty arrays. Use `paging.queue.mode: "suiteql"`, `display.template: "dashboard"`, `display.renderer: "html"`, and
`display.expanded: "none"`. Broader schema values don't authorize another method of retrieving time entries pending
approval or another presentation route.

Use verified facts to populate the relationships below. Keep exact record and check IDs, status values, and evidence.
Supply safe reasons for unavailable data instead of inventing facts or treating unknown values as zero.

Map the verified approval value stored on a time entry from `approval_status` to the existing string `entry.status`
through [Approval status](enums.md#approval-status). Preserve `scope.approvalStatus` as the existing review scope
string. Keep raw booleans out of the model and use the existing schema without adding a preference field.

## Accounts and dates

Use one account form:

- For session evidence, set `source: "session"`, non-empty `accountId`, `environmentType`, and `version`, and optional
  `connectionName`.
- For approved compatibility fallback, set `source: "connection"` and the selected `connectionName`. Don't invent
  session fields.

A connection name is display context, not a NetSuite hostname.

Set an explicit locale and company timezone in the model. Keep real business dates as `YYYY-MM-DD` and timestamps as
valid ISO values with an offset. Validate date ranges and keep each entry within its group period. Distinguish dates,
timestamps, durations, and week ranges. Keep user-facing strings separate from those values.

Use the NetSuite company date for business checks rather than the browser, host, session, or agent date. Use the company
date derived through [checks.md](checks.md#missing-weekly-time) for the cutoff for missing time.

## Identity and grouping

Build `owners[]` from the `employee` field on `timebill` and verified resource evidence. Use `ownerKind: "employee"` or
`"vendor"` only with complete `identityCoverage`. Use `"unknown"` with partial or unavailable identity coverage and a
safe nonblank reason. Store resource IDs as normalized nonzero signed base-10 strings. Keep each resource, entry,
timesheet, group key, and finding ID unique without leading or trailing whitespace.

Don't claim an unknown resource is an employee or give it resolved assigned/default calendar facts.

| Mode | Required group relationships |
| --- | --- |
| `weekly-timesheets` | Every group has `kind: "timesheet"`, real lowercase `recordType: "timesheet"`, internal ID, status, and key `timesheet:<canonical-timesheet-id>`. Each contained entry's `timesheetId` matches the group ID. |
| `weekly-time-tracking` | Every group has `kind: "week"` and key `week:<owner-kind>:<canonical-owner-id>:<period-start>:<period-end>`. Entries omit `timesheetId`. Groups have no record identity, status, actions, or target. |

Do not mix kinds or create a timesheet ID from a week. Keep the real period and reference context for each group,
including a group with no entries when supported by the review facts.

Set a real timesheet group's string `status` from that timesheet's own computed `approvalStatus` through
[Approval status](enums.md#approval-status). Keep it separate from `supervisorApproval` and the selected entry field.

## Findings and associations

Supply each finding's title, summary, classification, evidence, and stable unique ID. Keep an entry finding embedded on
the affected entry with `scope: "entry"`, `recordType: "timebill"`, and its matching ID. Keep weekly findings in
`weeklyFindings` and reference them through the owning group's `findingIds`.

A real timesheet finding uses `scope: "timesheet"` and its record ID. A finding for the presentation week uses
`scope: "week"` and only `reviewGroupKey`. Match every reference to its actual resource and group. Keep affected dates
within the owning period. Do not copy, combine, or deduplicate findings to alter presentation or counts.

Attach daily limit findings to every affected reviewed entry. Attach weekly findings once to the owning group. Preserve
group and resource findings at their own scope. Don't supply preformatted summary labels or icons.

Match structured evidence to its check, coverage, and business date or group key. Daily evidence uses `date`, while
weekly limit evidence uses `reviewGroupKey`. Include the observed integer minute value in finding evidence text so it
matches `observedMinutes`. Use the supported structured check IDs from the schema, rather than inserting
`missing-values` or neutral total IDs into a field that doesn't accept them.

For an applicable holiday check, classify a supplied finding as `exception` when its complete matching date fact proves
a holiday or nonworking date. For an applicable fixed daily comparison above 1440 minutes, including a partial lower
bound, supply an `exception` on every linked affected reviewed entry. A complete working date without a holiday can
support `no-issues-found` when the required evidence and aggregate coverage are complete. Don't add an unrelated holiday
fact to support that result.

## Calendar evidence and evidence for totals

Include `calendarReview` when a check that depends on the calendar is evaluated or calendar evidence is displayed. It is
optional only when neither is present. Use `checkIds` for the evaluated structured checks, independent calendar and
holiday coverage, retrieval time, assigned/default source, hours per day, configured weekday names and count, date
facts, effective thresholds, evidence for totals or threshold comparisons, and aggregate coverage.

Keep these relationships consistent:

- Complete calendar evidence has a source, valid hours, weekdays, their matching count, and retrieval time. Unavailable
  evidence has null source and calendar values. Unknown resources cannot claim resolved source or complete calendar
  evidence.
- Complete holiday coverage requires complete calendar coverage. Complete date facts require both, known booleans, and
  `workingDay = configuredWorkingWeekday && !holiday` with null reason. Partial or unavailable date facts have null
  booleans and a safe reason.
- List each threshold check in `checkIds` once. An available threshold has source, exact integer minutes, retrieval
  time, and null reason. Derive `work-calendar` minutes with the formulas in checks. A threshold with `unavailable` or
  `not-configured` status has null source, minutes, and evidence for threshold comparisons, with a safe reason.
- Keep daily evidence for totals or threshold comparisons tied to its business date and weekly evidence tied to an
  existing owning group, with `date: null`. Put threshold comparisons in the threshold's `populationEvidence`. Put the
  fixed daily rule in the calendar's separate `populationEvidence` array.
- Complete evidence for totals or threshold comparisons uses `basis: "exact"` and integer `observedMinutes`. Partial
  evidence uses `basis: "lower-bound"` and verified minutes. Unavailable evidence uses null basis and value,
  `conclusion: "inconclusive"`, and a safe reason.
- Derive conclusions from the comparison rules. Inconclusive evidence needs a reason. An approved conclusion has null
  reason. Exact observations and lower bounds cannot be below the displayed subtotal for the same date.
- Link applicable violations and incomplete comparisons to findings with matching check, date or group, observed
  minutes, and coverage. Retain every affected daily entry association. A proved partial minimum can suppress its
  exception, but still needs evidence of incomplete coverage.
- Keep `aggregateCoverage` incomplete when any required evidence for totals, threshold comparisons, or calendar facts is
  incomplete. Give incomplete aggregate coverage a safe reason. Complete aggregate coverage has null reason. It never
  becomes complete merely because a lower bound proves a violation or satisfies a minimum.

Apply [vendor applicability](#vendor-applicability) before requiring calendar facts or using comparisons to require
classifications. When disabled or unavailable vendor checks don't need calendar facts, you can retain `calendarReview`
with `calendarCoverage: "unavailable"`, `holidayCoverage: "unavailable"`, null source and calendar values, and empty
`dateFacts`. The schema doesn't accept `calendarReview: null`. Keep evaluated checks registered in `checkIds` and their
configured thresholds in `effectiveThresholds`. Validate every supplied fact even when a check doesn't need it. Preserve
any calendar evidence required by other checks.

For those vendor checks, retain a fixed daily comparison in `calendarReview.populationEvidence` only when its structure
and arithmetic are valid. A retained total above 1440 minutes doesn't require an exception or override the vendor
result. Keep configured threshold `populationEvidence` null when its status is `not-configured` or `unavailable`. Keep
aggregate coverage and unrelated readiness evidence separate from vendor applicability.

Report truthful models rejected by the restrictions described under [Known validation limits](#known-validation-limits).

## Metrics and coverage

Supply full scope metrics separately from displayed counts. The producer supplies each metric's `label`, `display`,
`unit`, optional `note`, value, and status. The helpers don't generate this text or construct the complete model.

Include `pendingEntries`, `pendingHours`, `entriesWithExceptions`, and `entriesWithReviewItems` once each. Use
`scope: "full"`. Exact and partial metrics have numeric values. Unavailable metrics have null values. Use exact display
values only for complete retrieval of the required time entries, `At least N` for verified lower bounds, and
`Not available` otherwise. Unknown hours aren't zero.

Supply these labels for the required metrics:

| Metric key | Required label |
| --- | --- |
| `pendingEntries` | `Pending entries` |
| `pendingHours` | `Pending hours` |
| `entriesWithExceptions` | `Entries with exceptions` |
| `entriesWithReviewItems` | `Entries with review items` |

Count distinct affected entries in exception and review item metrics. Keep weekly group findings separate from those
counts. For complete retrieval of time entries pending approval and a complete review with `sampleOnly: false`, pending
metrics equal the displayed entry count and total hours calculated from integer minutes. Set
`paging.displayed.ownerCount` to `owners.length`, `entryCount` to the displayed entries, and `timesheetCount` to real
timesheet groups, which is zero in presentation week mode.

Keep all four supplied metrics in the model unchanged when rendering. Don't add a required metric for incomplete checks.
Keep supplied pending totals instead of recalculating them from displayed entries or local filters, including in sampled
reports.

Keep global coverage, retrieval coverage for time entries pending approval, check coverage, and displayed sampling
truthful. Configured limit coverage can't be `not-configured` or `unavailable` while available thresholds or findings
about configured limits are present.

For each generated review model, add exactly one `Native approval limit validation` coverage item using the preference
retrieval attempt that supplies that review's settings. Import `deriveNativeApprovalLimitCoverage` from
`scripts/dashboard-model.mjs` and pass the raw `Perform limit check on approval action` value. Use `undefined` for a
missing row, preserve malformed values, and use an unknown value when retrieval failed. Append the returned item
unchanged. It sets `gatesReviewChecks: false` and supplies the exact messages and states for disabled, enabled, missing,
malformed, or unknown evidence. Don't convert failed retrieval to `F`.

Report settings obtained for an action through [action-messages.md](action-messages.md#report). Keep an existing review
model and its single coverage item unchanged after refreshing settings for an action. Generate a new model only for a
separately requested review through `SKILL.md`.

### Vendor applicability

When verified vendors are present, include exactly one item in `checkCoverage` with
`key: "vendor-time-threshold-applicability"`. Set its explicit `preferenceState` from Apply Time Threshold to Vendor
Time and use the matching `status` below. Validate a supplied item even when no verified vendors are present. Reject
duplicates, a missing or invalid `preferenceState`, and a state that contradicts `status`.

| `preferenceState` | Required `status` | Results for verified vendors |
| --- | --- | --- |
| `enabled` | `complete` | Apply each check with its required evidence. |
| `disabled` | `not-configured` | Use `not-configured` findings and threshold statuses. |
| `missing`, `malformed`, or `unknown` | `unavailable` | Use `could-not-check` findings and `unavailable` threshold statuses. |

Use `missing` for an absent preference row, `malformed` for an invalid value, and `unknown` when the preference couldn't
be retrieved. Don't treat unavailable evidence as disabled.

Apply this item to all five configured limits, `entry-minimum`, `working-day-minimum`, `working-day-maximum`,
`weekly-minimum`, and `weekly-maximum`, and both fixed checks, `daily-over-24-hours` and `holiday-or-non-working-day`.
Follow [resource applicability](checks.md#owner-and-feature-applicability) for the business rules. Keep employee checks,
unknown resource checks, employee checks for missing time, and neutral totals unchanged. Keep this item separate from
`configured-limits` coverage and the coverage item for `Native approval limit validation`.

## Display fields

Follow the privacy rules in [connector-tools.md](connector-tools.md#calls-and-privacy). Map a job match to
`entry.project` and its parent customer to `entry.customer`. A match only to a customer sets customer only. An item
match sets `entry.serviceItem`.

Display the supplied project name when available, otherwise the supplied customer name, otherwise `No project/customer`.

A populated value whose text is withheld or unresolved needs a non-empty presence placeholder. For example, use
`Memo entered (text not shown)` or `Project #<id> (name unavailable)`. Record unresolved lookups in coverage. Omit a
display field only when its source value is null. An omitted memo renders as `No memo`, so omission would misstate a
populated memo.

## Action requests

Use the dashboard for browsing review results. Handle a later chat request through the preview and confirmation
procedure in [actions.md](actions.md). The dashboard doesn't discover action capabilities, qualify records, call
Connector tools, or change NetSuite. Displaying a dashboard isn't confirmation.

## Validate and render

Construct the model in a temporary directory. Run these commands from the installed skill folder. Replace the example
model path with the actual model path.

`parseDashboardModel(jsonText)` is exported by `scripts/render-dashboard.mjs`. It validates schema structure and
semantic relationships and returns the supplied object unchanged. It doesn't construct, repair, or complete missing
fields or associations.

```bash
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { parseDashboardModel } from "./scripts/render-dashboard.mjs";
parseDashboardModel(readFileSync(process.argv[1], "utf8"));
console.log("Dashboard model is valid.");
' /tmp/time-approval-review/dashboard-model.json
```

Expect exit code 0 and `Dashboard model is valid.`. Fix producer errors and validate again. If truthful input is
rejected by a documented defect, report the rendering limitation. Don't invent facts, remove required evidence, or
change business classifications to pass validation.

```bash
node scripts/render-dashboard.mjs \
  --model /tmp/time-approval-review/dashboard-model.json \
  --template assets/dashboard.html
```

Expect exit code 0 and only the absolute dashboard path followed by a newline on stdout. Use that path to present the
generated file only after the command succeeds.

Leave cleanup to the user or host when the output is no longer needed. A failure can leave a directory and a partial
file.

Preserve `assets/dashboard.html` and use only this renderer. If Node or generation fails, report the limitation from
stderr. Don't improvise HTML, recreate the layout, replace template markers manually, produce a text dashboard, or link
a nonexistent file.

## Known validation limits

Check business findings separately from model acceptance. The validator checks supplied evidence and selected
relationships, but it doesn't audit every omitted check or reconstruct every required finding:

- Check definitions or findings can be omitted without detection, including a holiday finding on a proved nonworking
  date.
- A supplied finding can lack comparison evidence.
- Beyond supplied proven holiday findings and linked daily findings above 24 hours, classifications can still contradict
  comparisons.
- Date matching isn't complete across all findings and comparisons.
- Findings about missing time can lack structured proof that Actual Time is absent.
- Model acceptance does not establish complete business-check coverage. Independently verify each required comparison and preserve incomplete coverage.

Accepted models don't prove business correctness or eligibility for NetSuite actions. Report rejection of truthful input
instead of changing classifications, fabricating calendar evidence, or removing associations.

## Present the generated file

Generation and presentation are separate. A generated file proves only generation. Use `exact-inline-plus-link` only
after observing an exposed host facility mount that exact document. Put a standalone link to the same generated file
directly below it.

If exact mounting is unavailable or fails, use `link-only`. Give a short limitation message and a standalone link to the
generated file. Product names, graphical interfaces, file preview, source views, host recreations, Custom Visual,
Artifact, and host visualizations don't prove exact mounting. Don't ask another host feature to rebuild the dashboard.

Request link-only treatment for the attachment. Don't intentionally embed raw HTML or open an attachment preview. This
request is advisory. The host controls surrounding cards and previews, and the skill can't guarantee or suppress them.
Generation and component checks don't establish that a conversation host mounted the document.

## Comparison and navigation evidence

For each threshold, supply a separate effectiveThresholds row for each applicable entry/date/week comparison. Repeated check IDs must keep identical threshold status/source/minutes and distinct comparison identities. `entry-minimum` population evidence includes `entryId` and exact date, uses that entry's minutes, and must not use the daily sum. Include all requested dates/weeks; keep unavailable comparisons explicitly inconclusive. Overall aggregate coverage remains incomplete when any required check is incomplete, even if an independent check has no issue.

Populate optional `navigation` only with account-bound exact record URLs from supported connector/account navigation evidence, carrying recordType, internalId, url, accountOrigin, source and retrievedAt. Verify the URL identifies that selected account and record and is an ordinary HTTPS view destination, not an action endpoint. Never derive host or paths from an ID. Omit unavailable links and explain that records are shown by ID.
