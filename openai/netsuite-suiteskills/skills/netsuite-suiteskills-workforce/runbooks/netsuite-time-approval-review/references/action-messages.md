# Action messages

Use these formats for a confirmed Approve or Reject request. Follow [actions.md](actions.md) for preparation and
execution and [recovery.md](recovery.md) for result classification and verification.

## Contents

- [Shared wording](#shared-wording)
- [Preview](#preview)
- [Report](#report)
- [Large requests](#large-requests)
- [Examples](#examples)

## Shared wording

Identify records as Time entry or Timesheet with their IDs. Include record links when known and valid. Use plain IDs
when a link isn't available instead of inventing a URL. Label the field Approval status and use the established labels
from [enums.md](enums.md#approval-status). Describe unreadable or unexpected values as unavailable with a plain reason.
Keep raw record types, action identifiers, technical call details, and error codes in internal evidence.

Distinguish selected records from visible timesheet entries. Count each selected timesheet once, and keep its entry
details outside counts of selected records. Keep unknown hours unavailable rather than displaying zero.

## Preview

Show the account, action, preview timestamp with timezone, review status, ready count, and excluded count. State whether
the review was performed, reused with its timestamp, incomplete, or declined. When declined, state that no advisory
checks were performed for this request.

Use the fresh company settings obtained during preparation for this preview through
[actions.md](actions.md#tools-and-targets), including for a revised preview or a reused review.

Show every ready record with these columns:

| Record | Resource | Date or period | Approval status | Hours shown |
| --- | --- | --- | --- | --- |
| Time entry 1042 | Alex Example | 2026-10-05 | Pending | 8 |

State that ready records passed qualification for the requested action and meet its parameter requirements. Explain
known side effects and possible NetSuite notifications. Show hours as observed facts rather than promising the hours
that NetSuite will process.

List visible entries within each timesheet separately with the same columns. Identify their parent timesheet and explain
incomplete visibility. State that NetSuite determines the entries affected during execution. The visible list doesn't
promise that all listed entries, or only those entries, will be affected.

List every excluded record in a Record and Reason table. Use plain reasons such as "Reject isn't available for this
record" or "Action availability couldn't be verified." Explain duplicate removal and resolved overlap, identifying every
consolidated selection. For a revised preview, preserve earlier attempted results and identify the remaining unattempted
records covered by the new confirmation.

Identify earlier review findings by their review timestamp. Include the evidence supporting compliant entry selection or
findings on which the user relies. Explain limitations without presenting an earlier review as current.

Show the exact rejection subject and note in separate `text` blocks, preserving whitespace and line breaks. Identify
their scope with every applicable ready record or timesheet. Describe a timesheet note's scope without promising a note
on every child. State when no note is supplied. Keep excluded records outside the confirmed note scope.

Ask for explicit confirmation of the entire ready list, action, account, and exact subjects and notes shown. Use one
confirmation for the complete preview. When nothing is ready, explain exclusions without asking to confirm an empty
write. A material change requires a new preview and confirmation for remaining unattempted targets.

## Report

Show the account, action, report timestamp with timezone, attempted count, and counts for Completed, Partially
completed, Failed, Outcome unknown, and Not run. Count selected records once after deduplication and consolidation. The
attempted count excludes Not run. Keep exclusions visible and distinguish them from confirmed records left Not run. Use
Not run for excluded records that weren't attempted and identify their exclusion reasons. Include those records in the
Not run count, while showing the excluded count separately. Explain consolidated selections without counting them again
as selected records.

Show every selected record, including exclusions and remaining targets, with these columns:

| Record | Result | Approval status | Verification |
| --- | --- | --- | --- |
| Time entry 1042 | Outcome unknown | Approved | NetSuite shows Approved. The attempt's outcome couldn't be determined. |

Use only the five result labels. Use [recovery.md](recovery.md#inspect-execution-results) to classify execution. List
every supported timesheet entry result separately under its parent with the same columns. Entry details don't increase
counts of results for selected records. Report missing or uncertain entry evidence rather than inventing results from
parent success.

Report observed Approval status independently of execution. Include the verification timestamp and any limits. Keep a
clear Completed or Failed result when readback is unavailable. Preserve Outcome unknown when a later read shows Approved
without claiming that the uncertain attempt caused it. Mark values retained from an earlier read as stale.

Report relevant settings changes or retrieval failures from the final refresh through
[recovery.md](recovery.md#verify-and-refresh). If the approval mode changed, include the original mode and time for
earlier status observations. Explain that the final settings read didn't reread records or establish a new current
status. Retain known execution results when final settings are unavailable or approvals are now disabled.

Explain failures, partial results, exclusions, and why remaining records were Not run. Include NetSuite warnings and
notifications in plain language. Describe the effect of uncertainty on the remaining sequence and state that no
automatic retry occurred.

Report verification of each supplied subject and note against its exact confirmed text and scope. Distinguish verified
text, a readable difference, readable absence, and inability to verify. Don't call unreadable text missing. Note
verification doesn't change the execution result.

When an earlier dashboard exists, state its review timestamp and explain that it reflects that earlier review. Generate
a new dashboard only on request. Keep execution results in the report rather than updating earlier dashboard rows.

## Large requests

Count data rows across every record table before presenting the message. Include ready or result rows, exclusions,
consolidated selections when tabulated, and all visible timesheet entry rows. Count a record again if it appears in
another table. Table headings don't count. Show complete tables in chat up to and including 20 rows.

Above 20 rows, show a compact summary in chat and attach the complete preview or report as Markdown. Deliver the
attachment through the host before asking for confirmation of a large preview. A filename mentioned in chat isn't
attachment delivery. Use the attachment facility without adding an alternative delivery workflow.

Include every selected and excluded record, consolidation, visible timesheet entry, material fact, and exact note scope
in the full preview. One confirmation covers that complete ready list and notes. Include all supported record and entry
results, exclusions, remaining targets, and verification limits in the full report. Highlight unknown outcomes,
failures, partial results, and remaining records in chat even when the full tables are attached.

Deliver a new complete attachment when changed material facts require a revised preview and confirmation. Identify its
new timestamp and the remaining unattempted targets. Don't reuse an earlier attachment as the revised preview.

## Examples

Use these fictional messages as format examples. They don't describe executed actions or delivered files. Show record
links only when actual links are available. Replace example facts with verified request evidence.

### Direct request with a declined review and an exclusion

Account: Example Studio Sandbox. Action: Reject. Preview timestamp: 2026-10-06 10:00 UTC. Review status: Declined. No
advisory checks were performed for this request. Ready: 1. Excluded: 1.

| Record | Resource | Date or period | Approval status | Hours shown |
| --- | --- | --- | --- | --- |
| Time entry 1042 | Alex Example | 2026-10-05 | Pending | 8 |

Time entry 1042 passed qualification for Reject and meets its parameter requirements. NetSuite may send notifications.

| Record | Reason |
| --- | --- |
| Time entry 1043 | Reject isn't available for this record. |

Rejection subject for Time entry 1042 only:

```text
Please correct Tuesday
```

Rejection note for Time entry 1042 only:

```text
Please move the 2 hours to the correct project.
Keep the remaining hours unchanged.
```

Confirm Reject for the complete ready list of 1 record in Example Studio Sandbox with the exact subject and note above.

### Timesheet preview with incomplete visibility

Account: Example Studio Sandbox. Action: Approve. Preview timestamp: 2026-10-06 10:05 UTC. Review status: Reused from
2026-10-06 09:00 UTC. Ready: 1. Excluded: 0.

| Record | Resource | Date or period | Approval status | Hours shown |
| --- | --- | --- | --- | --- |
| Timesheet 2050 | Sam Example | 2026-09-28 to 2026-10-04 | Pending | 16 |

Visible entries in Timesheet 2050:

| Record | Resource | Date or period | Approval status | Hours shown |
| --- | --- | --- | --- | --- |
| Time entry 1050 | Sam Example | 2026-09-28 | Pending | 8 |

Some entries aren't readable. The timesheet's identity and scope are established, its Approve action passed
qualification, and no selection overlap remains unresolved. NetSuite determines the entries affected during execution
and may send notifications. The 09:00 UTC review recorded incomplete visibility. It doesn't establish every entry's
current condition. No rejection note is supplied.

Confirm Approve for the complete ready list of 1 timesheet in Example Studio Sandbox with this visibility limit.

### Partial results and uncertainty

Account: Example Studio Sandbox. Action: Approve. Report timestamp: 2026-10-06 10:15 UTC. Attempted: 2. Completed: 0.
Partially completed: 1. Failed: 0. Outcome unknown: 1. Not run: 1. Excluded: 0.

| Record | Result | Approval status | Verification |
| --- | --- | --- | --- |
| Timesheet 2051 | Partially completed | Pending | Read at 10:14 UTC. Entry results show completed and failed work. |
| Time entry 1042 | Outcome unknown | Approved | Read at 10:14 UTC. NetSuite shows Approved. The attempt's outcome couldn't be determined. |
| Time entry 1044 | Not run | Pending | Last read at 10:10 UTC is stale. Execution stopped after the uncertain attempt. |

Entry results in Timesheet 2051, excluded from the counts of selected records:

| Record | Result | Approval status | Verification |
| --- | --- | --- | --- |
| Time entry 1051 | Completed | Approved | Verified at 10:14 UTC. |
| Time entry 1052 | Failed | Pending | Verified at 10:14 UTC. NetSuite reported a permission failure. |

NetSuite completed Time entry 1051 and clearly failed Time entry 1052. The later independent attempt on Time entry 1042
had no interpretable response. Its observed Approved status doesn't establish the attempt's outcome. Time entry 1044
wasn't attempted, and no automatic retry occurred. No rejection note was supplied. The dashboard from 09:00 UTC reflects
that earlier review. Request a new review to generate a current dashboard.

### Completed rejection with unavailable verification

Account: Example Studio Sandbox. Action: Reject. Report timestamp: 2026-10-06 10:18 UTC. Attempted: 1. Completed: 1.
Partially completed: 0. Failed: 0. Outcome unknown: 0. Not run: 0. Excluded: 0.

| Record | Result | Approval status | Verification |
| --- | --- | --- | --- |
| Time entry 1042 | Completed | Unavailable | The exact record couldn't be read after execution. |

NetSuite clearly completed Reject. The subject and note confirmed for Time entry 1042 couldn't be read, so their text
couldn't be verified. This doesn't establish that either is missing or change the Completed result.

### Large request attachments

For a preview with 19 ready records, 1 exclusion, and 1 visible timesheet entry, deliver the complete file
`approve-preview-20261006-1020.md` through the host attachment facility. Then use this compact chat message:

> Account: Example Studio Sandbox. Action: Approve. Preview timestamp: 2026-10-06 10:20 UTC. Review status: Declined. No
> advisory checks were performed. Ready: 19. Excluded: 1. The attached complete preview contains all 21 table rows, the
> exclusion reason, and the limit on visibility within the timesheet. NetSuite determines the entries affected by the
> timesheet action. No rejection notes are supplied. Confirm Approve for the entire ready list of 19 records in the
> attached preview.

If material facts change before the remaining writes, deliver a new complete file such as
`approve-preview-20261006-1025.md` and request confirmation of its remaining ready list.

For the resulting large report, deliver `approve-report-20261006-1030.md` with every supported result and verification
limit. Then show the account, action, timestamp, attempted count, and each result count in chat. Identify any Outcome
unknown, Partially completed, Failed, or Not run records and exclusions in that summary, even when the complete tables
are attached.
