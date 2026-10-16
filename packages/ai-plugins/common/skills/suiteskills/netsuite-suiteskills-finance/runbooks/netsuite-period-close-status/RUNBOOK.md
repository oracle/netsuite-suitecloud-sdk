---
name: netsuite-period-close-status
description: "Use when asked where the close stands, what is blocking period close, or whether the target lock date can be met. Review observed accounting-period states, close-task evidence, owners, dependencies and pending financial activity. Keep missing evidence and specialist coverage explicit. Read-only; does not execute close tasks or lock a period."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-013
  category: finance
  access-mode: read_only
---

# Period Close Status


## Audience and use cases

**User roles:** Accounting Manager, Controller, Assistant Controller, CFO

**Use cases:** Answer where the close stands today; identify and sequence close blockers; quantify unposted and unapproved activity before lock; compare progress against a five-day or accelerated three-day close calendar; give an evidence-based lock date.



## Period Close Run

## Task

Report where close actually stands, what is blocking it, and what happens next — mapped to a
dependency level, not a flat checklist.

## Trigger boundary

Owns sequencing and status. Individual reconciliations hand off to
the unavailable broad account-reconciliation specialist (not packaged; Bank Reconciliation Prioritization is not an equivalent); elimination and intercompany work to
`netsuite-consolidation-tie-out` (a required specialist handoff not present in the selected target catalog; do not treat a similarly named intercompany analysis as an equivalent consolidation/elimination workflow); control findings to `netsuite-finance-controls-review`.

The pinned catalog establishes reference identities, not installed host availability. Discover the actual specialist before claiming a handoff. If the consolidation procedure is unavailable, label that result as unavailable and continue independently supported period, task and pending-activity sections. This skill may report an observed consolidation checklist state with its source; it cannot perform or certify the missing specialist outcome. No missing specialist is a reason to invent a route or report that consolidation passed.

## Procedure

1. Resolve the user's accounting period, subsidiary/consolidation, accounting book, currency and as-of scope using the [close evidence procedure](references/close-evidence.md#scope-and-period-selection). Resolve ambiguous periods or scopes before dependent reads; do not infer fiscal period from a calendar month or silently select an adjustment period.
2. Follow the [source and reconciliation steps](references/close-evidence.md#retrieve-the-requested-evidence) to obtain observed period flags, available checklist/task evidence and the requested pending-activity populations. Retrieve only the sections needed for the question; a selected period-state question does not require an unrelated full-close investigation.
3. Count distinct transactions in verified type-specific populations and qualify amounts, overlap and posting-period coverage using [pending financial activity](references/close-evidence.md#pending-financial-activity). Missing source or coverage evidence leaves only the affected result unknown or partial.
4. Place the evidenced state on the dependency model below. Name evidenced blockers, their levels, owners or unknown ownership, and supporting sources. Keep recorded task completion separate from model readiness and missing evidence.
5. Estimate the earliest realistic lock date only from evidenced owner estimates, dependencies, working calendar and remaining durations. If these are unavailable, report the estimate as unknown and name the missing inputs; retain the stated target separately. The number of open levels and the illustrative close calendar do not supply durations.

## Dependency model

| Level | Contents |
| --- | --- |
| 1 | Cash receipts and disbursements, payroll posting, depreciation and amortization, routine AP accruals, intercompany posting |
| 2 | Bank reconciliation, revenue recognition, AR and AP subledger reconciliation, FX revaluation, remaining accruals |
| 3 | Balance sheet reconciliations, intercompany reconciliation, adjusting entries from reconciliations, preliminary trial balance |
| 4 | Tax provision, equity roll-forward, consolidation and eliminations, draft financial statements, preliminary flux |
| 5 | Management review, final adjustments, hard close and period lock, reporting package distribution, forecast update |

Under this skill's stated five-level readiness policy, level N+1 is not ready for final completion while an applicable level N item remains open. Preserve that policy when reporting readiness. Separately report the actual recorded task status: a higher-level task may be recorded complete yet not satisfy this model's final-readiness gate. Do not overwrite observed task completion or claim the model is a system-enforced dependency. Establish whether an item is applicable from evidenced customer close policy; missing evidence is not proof that it is not applicable.

When an applicable prerequisite's completion or applicability is not verified, final readiness that depends on it is not verified. Where an evidenced open prerequisite already prevents readiness, retain not ready and disclose other unknowns separately. Do not turn an evidence gap into a confirmed operational blocker. Observed lock/closed flags do not prove reconciliation, elimination, management review or every modeled close item is complete.

## Close calendars

**Five-day close** — T+1 level 1; T+2 level 2; T+3 level 3; T+4 level 4; T+5 level 5.

**Accelerated three-day close** — only where recurring entries, reconciliations, and intercompany
processes are already largely automated before period end. Do not recommend it otherwise.

## Known bottlenecks to check for

Late AP accrual inputs from departments. Recurring manual journal entries. Reconciliations started
too late. Delayed intercompany confirmation. Management review happening only at the very end.

## Output

Use concise native text and the relevant rows below; no file or graphical dashboard is required. For a narrow period-state question, answer that fact with scope, source/time and its limits rather than populating unrelated sections.

For a close review, show:

- Scope and evidence time: period identity/type, requested subsidiaries/consolidation, book, currency groups and as-of basis; label current versus historical evidence accurately.
- Observed period state: each available lock/closed flag with its actual source scope. Missing flags remain not verified; do not duplicate a global flag as subsidiary-specific evidence.

| Level | Recorded completion | Model final readiness | Evidenced blocker or evidence gap | Owner | Source and time |
| --- | --- | --- | --- | --- | --- |
| Applicable level | Observed state or not verified | Ready, not ready, or not verified with basis | Separate unmet prerequisites from missing evidence | Observed owner or unknown | Actual evidence reference and time |

- Pending activity: type, distinct count, complete/partial/unavailable population, overlap qualification, compatible amount basis and missing-period coverage. Unknown is not zero.
- Specialist coverage: state whether consolidation analysis is available; an observed checklist status is separate from specialist verification.
- Target and estimated lock date separately, with duration/calendar basis or missing inputs. Name the next supported work without implying execution.

Financial and readiness conclusions remain preliminary while the period is not observed closed. Even an observed closed period does not certify unverified checklist, financial-source or specialist coverage; retain each limitation.


## Plugin contracts

Apply the pinned plugin context and shared baseline, retrieval, evidence, outputs and action contracts supplied with this package. Domain-specific retrieval instructions above take precedence over the shared default within common safeguards. Verify current callable tool schemas, metadata, scope and access; no guessed schema or access-denial bypass. Preserve unknown and partial evidence. Requested analysis does not authorize external changes. Reuse authorization for an exact supported action and verify the result under the action contract.

## Coverage and amounts

Count distinct transactions by type and distinguish pending approval from unposted state; overlapping sets are not additive. Separate currencies and actual amount bases, and mark impact unknown where absent. A balanced journal net of debits and credits is not evidence of no impact. Record evidence source/time per task and separate open, completed, not applicable, not verified and blocked. A blocker requires an evidenced unmet prerequisite, not mere lack of connector visibility. Route an unavailable specialist workflow as an explicit capability gap while retaining independently supported close status.

## Vocabulary

AP means accounts payable; AR means accounts receivable; FX means foreign exchange; CFO means chief financial officer. In the illustrative close calendars, T is period end and T+n is the customer-defined working day after period end. Calendar targets are not observed completion or promised lock dates.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
