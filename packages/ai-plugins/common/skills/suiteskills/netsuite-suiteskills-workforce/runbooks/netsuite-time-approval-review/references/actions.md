# Actions

Prepare exact targets for a confirmed NetSuite Approve or Reject request. Keep advisory review results separate from
qualification of the requested action. Follow the requested action procedure in `SKILL.md` before these instructions.

## Contents

- [Tools and targets](#tools-and-targets)
- [Qualify the requested action](#qualify-the-requested-action)
- [Normalize the selection](#normalize-the-selection)
- [Fresh reads and material facts](#fresh-reads-and-material-facts)
- [Timesheet scope](#timesheet-scope)
- [Preview and confirmation](#preview-and-confirmation)
- [Refresh and execute](#refresh-and-execute)
- [Rejection note](#rejection-note)

## Tools and targets

Discover `ns_getRecordActionMetadata` and `ns_executeRecordAction` only for an Approve or Reject request. Discover them
separately and preserve each result. If either tool is missing, explain that the request can't be performed through this
connection. Keep the ordinary review available, and don't execute targets.

Use only lowercase `timebill` for a real Actual Time entry and lowercase `timesheet` for a real weekly timesheet. A
presentation week or `reviewGroupKey` has no record identity. Ask for real record targets instead of using a week as an
action target.

Bind selection, preview, execution, and verification to the account selected through
[connector-tools.md](connector-tools.md#resolve-the-account-first). Complete the readiness, timezone, and fixed
preference checks in `SKILL.md` before reading targets or qualifying actions. Stop when approvals are disabled or the
required approval configuration can't be determined. Keep the fixed queries and approval mode interpretation unchanged.

During preparation before each initial or revised preview, refresh the company timezone and accounting preferences. Run
the fixed timezone query immediately before the fixed query for the 22 preferences through
[connector-tools.md](connector-tools.md#fixed-companypreference-query). This preparation pair is the refresh before the
preview, including when you reuse other evidence from an accepted earlier review. Retain the settings and their
retrieval timestamps for that preview and the confirmed execution that follows it.

If the active connection no longer points to the selected account, stop, select the intended account, reread records,
and prepare a new preview and confirmation.

Establish the exact Approve or Reject `actionId` through action discovery or returned metadata. A discovery call can
identify an action and its parameters. A type's returned `actions` list doesn't prove that an instance permits the
action. If the requested identifier or required metadata can't be established, exclude the target because availability
or parameter requirements couldn't be verified. Use a returned identifier instead of guessing one from a display name.

## Qualify the requested action

Call `ns_getRecordActionMetadata` sequentially for each selected normalized target with all three values together:

- Supply `recordType` as `timebill` or `timesheet`.
- Supply the exact requested `actionId` established by discovery or metadata.
- Supply `recordId` as the exact normalized ID read from the selected account.

A call without all three values doesn't qualify a target. Validate the returned result against the requested account,
instance, and action. Inspect MCP protocol failures, `isError`, and tool errors. Treat malformed results and any
returned identity or action that conflicts with the request as unable to verify. Use the documented returned shape
rather than assuming an `actions` array. Keep the qualification request, response, timestamp, parameter requirements,
and technical evidence internally.

Use this decision for every requested action:

| Qualification evidence | Decision |
| --- | --- |
| A validated response has `success = true` for the requested instance and action, without a protocol or tool failure. | Treat the action as qualified. Make the target ready only after target, scope, and parameter checks are complete. |
| A validated response has `success = false` and `errorCode = SSS_INVALID_ACTION_ID` for the requested instance and action. | Exclude the target because the requested action is unavailable. |
| Any other failed, unexpected, malformed, mismatched, or uninterpretable response, or missing metadata. | Exclude the target because availability couldn't be verified. |

Explain the exclusion plainly in messages. An unrelated metadata failure isn't proof that the action is unavailable.
Qualify each entry independently. Qualify a real timesheet through its parent action, as described in
[Timesheet scope](#timesheet-scope). Use the returned NetSuite action instead of changing approval status through a
generic record update.

## Normalize the selection

Treat IDs supplied through chat as untrusted and potentially stale. Read every exact target in the selected account.
Confirm its real record identity and Actual Time scope before normalizing it. Explain unreadable, missing, or invalid
targets as exclusions instead of guessing their identity.

1. Normalize each record ID as a nonzero signed base-10 string using the established identity rules. Deduplicate by
   account, `recordType`, and record ID, including repeated selections across views. If repeated selections differ in
   action or note intent, ask the user to choose before deduplicating. Preserve the requested action and exact subject
   and note for each target.
2. Read a selected real timesheet's current membership. Use NetSuite membership instead of inferring it from a
   presentation week.
3. When a timesheet contains a separately selected entry with the same action and rejection subject, note, and note
   intent, keep the timesheet and remove the redundant entry target. Explain that consolidation in the preview.
4. When actions, rejection subjects, note text, or note intent differ, ask the user to choose the timesheet or entry
   selection. Resolve the conflict before preview.
5. If missing membership evidence leaves possible overlap unresolved, ask the user to choose the parent or entry
   selection before preview. Don't treat unreadable entries as absent. Proceed only after the choice resolves overlap.

An exact direct target needn't appear in the pending query or pass an advisory review. If pending retrieval is partial,
read and qualify the explicit target independently. Preserve that review limitation without making it action
ineligibility. If the user declined the offered review, perform no advisory checks.

A request to approve all compliant entries requires a complete current review of the requested scope, with complete
retrieval and a recorded result for every applicable check. Select individual entry targets whose applicable checks
completed without an Exception, Review item, or Could not check. Include relevant parent findings and resource evidence.
Use [checks.md](checks.md#result-contract) without claiming legal or policy compliance. Record the review timestamp,
scope, coverage, identities, material facts, and check results that support each selection. Keep these targets as
entries instead of widening the request into timesheet actions. If the review is incomplete or declined, ask for
explicit targets or a complete review instead of selecting all compliant entries from partial results.

A request or selection starts preparation. Obtain confirmation of the complete preview before executing it.

## Fresh reads and material facts

Read only selected normalized targets for action preparation. Discover and qualify actions only for this request, rather
than qualifying every time entry pending approval for a dashboard.

Before preview, perform these steps sequentially:

1. Verify the selected account and reread each exact target. Confirm its identity, resource, date or period, Actual Time
   scope, current approval value, and hours shown. Report unreadable facts explicitly.
2. Read current membership and visible entries for a selected real timesheet. Resolve overlap through
   [Normalize the selection](#normalize-the-selection).
3. Interpret current approval values through [enums.md](enums.md#approval-status), using the validated approval mode
   retained from preparation for this preview. Keep a timesheet's own computed value separate. Report unexpected or
   unreadable values as a limitation instead of inventing a status. Don't remap `approval_status`, `entry.status`, or
   `scope.approvalStatus`.
4. Record accepted review findings with their timestamp when applicable. Refresh checks used to select all compliant
   entries or findings on which the user relies. When a review was declined, skip advisory classification and
   enrichment.
5. Qualify the requested action with all three identifiers. Verify its returned parameter requirements and prepare any
   rejection subject and note through [Rejection note](#rejection-note).

Bind the preview to the account, requested action, exact ready list, current identities, resources, dates or periods,
approval values, hours shown, timesheet membership and visible scope, action availability, parameter requirements, and
exact rejection subjects and notes. Record missing visibility as part of these facts.

When selection or the user's decision depends on a review, also capture its material facts:

- Record resource classification and identity coverage for the `employee` field on `timebill`.
- Record the assigned or default calendar source, calendar coverage, holiday coverage, and date classification.
- Record the exact effective threshold, formula, source, and availability.
- Record the basis of totals or threshold comparisons, `exact`, `lower-bound`, or unavailable, along with observed
  minutes, coverage, conclusion, and date or owning `reviewGroupKey`.
- Record Apply Time Threshold to Vendor Time, including its `T`, `F`, or unavailable evidence where relevant.
- Record dependent findings, classifications, and results, including those used for compliant entry selection.

Refresh the same record, membership, calendar, and review facts immediately before each execution. Use the company
settings retained from the latest preview when rerunning dependent checks and interpreting approval values. Preserve the
company date already established for the applicable review cycle. A change in a material value or its availability
requires fresh company settings, a revised preview, and explicit confirmation for the remaining unattempted targets.
Refresh review evidence only when the request depends on it. Pending-query inclusion isn't an independent action
prerequisite.

## Timesheet scope

Qualify a selected real timesheet with its parent `recordType`, `actionId`, and `recordId`. Don't require a Pending
parent status or successful qualification of every child. Keep visible child evidence separate from qualification of the
parent. Individually selected entries still require their own qualification.

Read current membership and list visible entries separately from the selected parent. State that NetSuite determines
which entries the timesheet action affects during execution. A visible list isn't a promise that every listed entry, or
only those entries, will be affected.

Permit incomplete entry visibility when the parent identity and scope are established, the parent action qualifies, and
no selection overlap remains unresolved. Explain the visibility limit before confirmation. If missing data prevents
identifying the parent or explaining its scope, exclude it. If it prevents resolving overlap, obtain the user's choice
through [Normalize the selection](#normalize-the-selection).

## Preview and confirmation

Present one complete preview through [action-messages.md](action-messages.md#preview), using the facts from
[Fresh reads and material facts](#fresh-reads-and-material-facts). Apply its complete tables, note scope, exclusions,
and [attachment rule](action-messages.md#large-requests) before requesting confirmation.

Request explicit confirmation for the complete ready list and exact notes. If no targets are ready, explain the
exclusions instead of asking for confirmation of an empty write. A dashboard, original request, or supplied target isn't
confirmation of unseen or refreshed facts. Material changes require a revised preview and new confirmation for the
remaining ready list.

## Refresh and execute

Process confirmed targets sequentially. Keep each target's attempted state and execution evidence throughout this
request, including after a revised preview. Never execute an already attempted target again in this request.

Use the company settings obtained before the latest preview throughout its confirmed execution. Refresh settings at the
preview and final summary points described here, rather than after confirmation or before each target's write.

Immediately before each target's write, perform these steps in order:

1. Verify that the connection still points to the selected account. If it changes or identity becomes unclear, stop and
   resolve the account and target before preparing a new preview.
2. Reread the exact target, current timesheet membership and visible entries where applicable, and the
   [material preview facts](#fresh-reads-and-material-facts). Resolve any new overlap before preview. Rerun advisory
   checks only when the selection or the user's decision relies on them. Skip them when review was declined.
3. Qualify the requested action afresh with `recordType`, `actionId`, and `recordId` together. Recheck parameter
   requirements and the exact rejection subject and note. Apply the
   [qualification decision](#qualify-the-requested-action) when a target no longer qualifies or availability can't be
   verified.
4. Compare the refreshed facts and their availability with the confirmed preview. If any material fact changes, preserve
   completed results, refresh company settings, update exclusions, and present a revised preview for only the remaining
   unattempted targets. Apply the preparation checks before that preview. Obtain explicit confirmation before
   continuing. Use Not run for a target that isn't attempted.
5. Call `ns_executeRecordAction` once with the confirmed target's exact `recordType`, `actionId`, and `recordId`, and
   its prepared `actionParameters` when applicable. Record the attempt even if no response arrives. Preserve the full
   execution evidence, warnings, and notifications internally.
6. Inspect and classify the execution, then verify current approval status and readable notes through
   [recovery.md](recovery.md#inspect-execution-results) before considering the next target. Continue independent targets
   after a clear failure or clear partial result. Stop on uncertain execution or a failure affecting the connection,
   session, or tool, and mark all remaining unattempted targets Not run.

Unavailable calendar context can make a dependent review check Could not check. It isn't itself action ineligibility for
a direct request. Preserve the qualification evidence and let NetSuite decide the action outcome. Don't predict missing
time findings for vendors. If Approve returns a missing time warning or result, report it truthfully.

Perform limit check on approval action controls NetSuite limit validation during Approve. When enabled, NetSuite
validation can return notifications. When disabled, NetSuite limit enforcement is disabled. It doesn't apply to Reject
or replace this skill's review checks. Standard Tools has no warning continuation or override contract.

After execution finishes or stops, attempt one final refresh of the company timezone and accounting preferences before
presenting the summary. Run the same fixed timezone query immediately before the fixed preference query, including after
partial completion or uncertain execution. Report relevant settings changes or retrieval failures alongside the known
action outcomes through [action-messages.md](action-messages.md#report). Preserve observations and outcomes through
[recovery.md](recovery.md#verify-and-refresh). A request with one preview and one final summary performs four reads of
company settings, for one target or many, for Approve or Reject.

Generate a new dashboard only when requested. Keep execution outcomes separate from verification of approval status.

Do not assume a dry run, preview token, atomic batch, rollback, idempotency key, warning continuation, or safe retry.
Use the confirmed execution and recovery procedures instead.

## Rejection note

Preserve the user's rejection subject and note exactly, including whitespace and line breaks. Wording such as "ask the
submitter" or "tell the submitter" becomes the NetSuite rejection note. Keep separate messaging outside the skill.

Use the returned parameter requirements for Reject. Ask for a required missing subject or note. Don't invent a subject
or replace missing required values with empty strings. When the user supplies both strings, encode them exactly:

```javascript
const actionParameters = JSON.stringify({ noteSubject, note });
```

Pass `actionParameters` as JSON text, rather than as an object or manually assembled JSON. When only one string is
supplied, preserve it and use only an encoding supported by the returned metadata. Ask for a missing value when the
metadata requires it. Don't guess how to represent an optional absent value.

If metadata can't represent a supplied parameter or its requirements can't be verified, exclude that target and explain
the limitation. Preserve the supplied wording instead of silently dropping or changing a subject or note. State when no
note will be supplied, and obtain any values the action requires before preview. Confirm the exact subject, note, and
scope with the complete ready list.
