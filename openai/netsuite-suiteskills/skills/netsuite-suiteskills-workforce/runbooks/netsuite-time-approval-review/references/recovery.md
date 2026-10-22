# Recovery

Use these instructions when retrieval, qualification, execution, or verification fails or is incomplete. Follow
[actions.md](actions.md) for fresh reads and confirmation, [connector-tools.md](connector-tools.md) for retrieval
validation, and [output.md](output.md) for generation and presentation failures.

## Contents

- [Incomplete retrieval and qualification](#incomplete-retrieval-and-qualification)
- [Inspect execution results](#inspect-execution-results)
- [Multiple targets](#multiple-targets)
- [Uncertain outcomes and later attempts](#uncertain-outcomes-and-later-attempts)
- [Verify and refresh](#verify-and-refresh)

## Incomplete retrieval and qualification

Retain verified time entries pending approval and mark retrieval partial after a failed request or page. An incomplete
page sequence isn't an empty result or a complete snapshot. Block selections of all pending or all compliant entries
from incomplete retrieval. Ask for explicit targets or complete retrieval instead.

An explicitly selected record can proceed after exact account and target reads, normalization, resolved overlap,
discovery of the action tools, qualification, preview, and confirmation through [actions.md](actions.md). A completed
review and inclusion in the pending query aren't prerequisites for that direct target. If the offered review was
declined, skip advisory checks. Otherwise, mark only dependent checks Could not check and preserve independent results.

Qualify with the exact `recordType`, `actionId`, and `recordId` together. Follow the
[qualification decision](actions.md#qualify-the-requested-action). A validated `success = false` with
`errorCode = SSS_INVALID_ACTION_ID` means the requested action is unavailable. Other failed, malformed, unexpected, or
mismatched results mean availability couldn't be verified. Exclude the target and explain the plain reason. Keep the
technical evidence internally instead of presenting error codes to the user.

If either action tool is missing, keep the review available and explain that the action request can't be performed
through this connection. If parameter requirements can't be verified or supplied rejection text can't be represented,
exclude the target rather than dropping the text. Use Not run when no execution occurred.

Qualify selected entries individually and real timesheets through the parent action. Keep parent qualification separate
from visible entry evidence. Incomplete entry visibility can proceed under [Timesheet scope](actions.md#timesheet-scope)
when parent identity and scope are established and overlap is resolved. Explain visibility limits before confirmation.
Ask the user to choose the parent or entry selection when missing membership evidence prevents resolving overlap.

For unexpected or unreadable approval values, report the limitation and use [enums.md](enums.md#approval-status) for the
selected entry mode and the separate computed timesheet value. Don't invent a status or substitute an approval field. A
material change requires the new preview and confirmation defined in
[actions.md](actions.md#fresh-reads-and-material-facts).

## Inspect execution results

For each attempted target, retain the exact request, response, and timestamp internally. Inspect every available layer:

- Inspect MCP protocol failure and `isError`.
- Inspect Standard Tool `success`, error fields, and message.
- Inspect the NetSuite `response`, warnings, and every notification.
- Inspect every supported child, individual entry, nested, or platform result, especially for a timesheet. Preserve each
  identifiable entry's evidence separately from the parent.

A parent or top-level success doesn't prove that every child completed. Use the supported returned evidence instead of
assuming a response shape or inventing entry results. If missing entry evidence prevents establishing the timesheet
outcome, use Outcome unknown. Missing visibility isn't proof that an entry was absent or unaffected.

Classify execution separately from verification of current approval status. Use only these result labels:

| Result | Use this evidence. |
| --- | --- |
| Completed | Execution clearly succeeded and every supported entry result agrees. |
| Partially completed | Supported entry results establish a mixture of completed and clearly failed work. |
| Failed | Execution clearly failed. |
| Outcome unknown | The response is absent, malformed, ambiguous, or insufficient to establish the execution outcome. |
| Not run | The target wasn't attempted. |

Preserve Outcome unknown when any supported entry result is uncertain, even if other entries clearly completed or
failed. A clear failure for the whole action can establish Failed without child results. Don't infer complete success
from the parent when the entry evidence is insufficient. Count each selected timesheet once in the record result counts.
List its supported entry results separately without adding them to the selected record counts.

A clear Completed or Failed execution can have unavailable verification. Keep its execution label and report the
readback limitation separately. Don't add a result label for failed readback. A later status compatible with success
doesn't establish that an uncertain attempt completed.

Warnings and notifications are information returned after execution. Report them accurately. Don't execute again to
continue or override a warning.

## Multiple targets

Follow [Refresh and execute](actions.md#refresh-and-execute) sequentially for each confirmed target. Continue later
independent targets after a clear record failure or clear partial result, with fresh reads and qualification before each
write. Don't repeat a target already attempted in this request, including a failed or uncertain attempt.

Stop the sequence after a transport, connection, session, or failure affecting the tool, or an uncertain execution
outcome. Mark all unattempted targets Not run. Use each target's own evidence rather than extending one record's failure
to another.

If refreshed material facts or their availability change before a write, preserve earlier results and obtain
confirmation of a revised preview for only the remaining unattempted targets. Resolve changed account or target identity
before preview. Apply the qualification exclusions when availability changes, and report exclusions without executing
those targets.

## Uncertain outcomes and later attempts

Use Outcome unknown for a timeout, missing response, connection loss, malformed result, or otherwise unclear execution
response. Don't retry automatically. Read current state when possible and report what NetSuite shows without claiming
the attempt caused that state. Unchanged status doesn't prove the absence of side effects.

If the user requests a later attempt, treat it as a new request with fresh account and target reads, qualification, a
preview, and explicit confirmation. Don't automatically retry an unchanged permission failure, unavailable action, or
validation failure. Finish the current request with its attempted results and remaining Not run records.

There is no promised rollback or automatic compensation for completed NetSuite actions. Report outcomes for each target
without implying the sequence is atomic.

## Verify and refresh

When possible, reread the exact selected target and each identifiable affected entry independently. Bind each read to
the selected account, retain its timestamp and approval mode, and use the validated approval mode retained from the
latest preview through [actions.md](actions.md#refresh-and-execute). If a read can't be interpreted with that mode,
report a verification limitation instead of refreshing settings, substituting a different field, or inventing a status.

- When Advanced Approvals on Time Records is disabled, read the entry's `supervisorApproval`. Interpret checkbox values
  through [enums.md](enums.md#approval-status).
- When Advanced Approvals on Time Records is enabled, read the entry's numeric `approvalStatus` through the same
  reference.
- Read the timesheet's own computed numeric `approvalStatus` separately in either entry mode. It doesn't establish every
  entry's current status or execution result.

Report observed Approval status and verification limits independently of the execution label. Preserve Outcome unknown
after a timeout even if readback shows Approved. Don't claim that the uncertain attempt caused an observed status.
Report unexpected values, mismatches, incomplete visibility, or unreadable records as verification limits. Mark any
values retained from an earlier read as stale rather than current.

Verify a supplied rejection subject and note against their confirmed exact text and scope when readable. Report verified
text, a readable difference, or readable absence accurately. If the role or response can't expose the subject or note,
report that it couldn't be verified. Don't call unreadable text missing or promise a note on every timesheet entry. Note
verification doesn't change the execution label.

Use the final settings refresh required by [actions.md](actions.md#refresh-and-execute) after execution finishes or
stops. If the final approval mode differs, preserve earlier status observations with their original mode and time.
Report the change and identify those observations as earlier values. Make no additional record reads because of the
final refresh. A settings read alone doesn't establish a new current record status.

If the final refresh fails or finds Require Approvals on Time Records disabled, report the limitation or change and
retain known action outcomes. Keep Completed writes Completed and Failed writes Failed. Preserve Outcome unknown when
execution evidence is uncertain. Report the summary even when the final settings are unavailable. Follow the existing
confirmation and recovery rules for later attempts or resumed writes.

Report action outcomes through [action-messages.md](action-messages.md#report), including its
[attachment rule](action-messages.md#large-requests). Keep technical evidence internally and apply privacy rules from
[connector-tools.md](connector-tools.md#calls-and-privacy).

Generate a new dashboard only when the user requests it. Run the ordinary review from current NetSuite data for that
request instead of subtracting local rows or hours. Don't require a rerun of the pending query or a new dashboard to
report an action. When an earlier dashboard exists, state that it reflects its earlier review timestamp. Don't update
its rows locally, present it as current, or add a Completed Activity section. Use the chat report for execution results.
